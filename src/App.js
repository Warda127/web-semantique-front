import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PersonSearch from './components/PersonSearch';
import AIChat from './components/AIChat';
import './App.css';
// new imports for transport UI + service
import TransportModeList from './components/TransportModeList';
import TransportModeDetail from './components/TransportModeDetail';
import { TransportModeService } from './services/transportModeService';

function deriveTabFromPath(pathname) {
  if (!pathname) return 'persons';
  if (pathname.startsWith('/ai')) return 'ai';
  if (pathname.startsWith('/stations')) return 'stations';
  if (pathname.startsWith('/transports')) return 'transports';
  if (pathname.startsWith('/persons')) return 'persons';
  return 'persons';
}

// helper: extract localName from /transports/:localName
function getTransportLocalName(pathname) {
  if (!pathname) return null;
  const m = pathname.match(/^\/transports\/([^\/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// add helper to detect debug flag from URL
function getDebugFlag() {
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}

function AppContent() {
  const debug = getDebugFlag();

  // initialize from actual location.pathname (no react-router)
  const [activeTab, setActiveTab] = useState(() => deriveTabFromPath(window.location.pathname));

  // transport modal state
  const [transportMode, setTransportMode] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // load detail by localName
  async function loadTransport(localName, debug = false) {
    if (!localName) {
      setTransportMode(null);
      setModalError(null);
      setModalLoading(false);
      return;
    }
    setModalLoading(true);
    setModalError(null);
    try {
      const { mode } = await TransportModeService.getModeByLocalName(localName, debug);
      setTransportMode(mode);
    } catch (err) {
      setModalError(err);
      setTransportMode(null);
    } finally {
      setModalLoading(false);
    }
  }

  // keep URL -> state in sync when browser navigation occurs
  useEffect(() => {
    const onPop = () => {
      const tab = deriveTabFromPath(window.location.pathname);
      setActiveTab(tab);
      const local = getTransportLocalName(window.location.pathname);
      if (tab === 'transports' && local) {
        loadTransport(local);
      } else {
        // clear modal when not on a transport detail route
        setTransportMode(null);
        setModalError(null);
        setModalLoading(false);
      }
    };
    // on mount, if landing on /transports/:localName load it
    const initialLocal = getTransportLocalName(window.location.pathname);
    if (deriveTabFromPath(window.location.pathname) === 'transports' && initialLocal) {
      loadTransport(initialLocal);
    }

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'persons':
        return <PersonSearch />;
      case 'ai':
        return <AIChat />;
      case 'stations':
        return <div className="content"><h1>🚉 Gestion des Stations (À implémenter)</h1></div>;
      case 'transports':
        return (
          <div className="content" style={{ position: 'relative' }}>
            <TransportModeList
              debug={debug}
              onSelect={m => {
                const local = m?.id;
                if (local) {
                  const to = `/transports/${encodeURIComponent(local)}`;
                  if (window.location.pathname !== to) window.history.pushState({}, '', to);
                  setActiveTab('transports');
                  loadTransport(local, debug);
                }
              }}
            />
            {modalLoading && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)'
              }}>
                <div style={{ background: '#fff', padding: 16, borderRadius: 6 }}>Loading...</div>
              </div>
            )}
            {transportMode && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)'
              }}>
                <div style={{ background: '#fff', padding: 12, borderRadius: 6, maxWidth: '90%', maxHeight: '90%', overflow: 'auto' }}>
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => { window.history.pushState({}, '', '/transports'); setTransportMode(null); }}>Close</button>
                  </div>
                  <TransportModeDetail mode={transportMode} showDebug />
                </div>
              </div>
            )}
            {modalError && (
              <div style={{ color: 'red', marginTop: 8 }}>Error loading transport: {String(modalError.message || modalError)}</div>
            )}
          </div>
        );
      default:
        return <PersonSearch />;
    }
  };

  // when Sidebar changes tab, update state and push history
  function handleTabChange(tab) {
    setActiveTab(tab);
    const map = {
      persons: '/persons',
      ai: '/ai',
      stations: '/stations',
      transports: '/transports'
    };
    const to = map[tab] || '/persons';
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
    // clear transport modal when leaving transports
    if (tab !== 'transports') {
      setTransportMode(null);
      setModalError(null);
      setModalLoading(false);
    }
  }

  return (
    <div className="App">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default function App() {
  // no Router wrapper required; use History API instead
  return <AppContent />;
}