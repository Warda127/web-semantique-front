import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PersonSearch from './components/PersonSearch';
import AIChat from './components/AIChat';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('persons');

  const renderContent = () => {
    switch (activeTab) {
      case 'persons':
        return <PersonSearch />;
      case 'ai': 
        return <AIChat />;
      case 'stations':
        return <div className="content"><h1>🚉 Gestion des Stations (À implémenter)</h1></div>;
      case 'transports':
        return <div className="content"><h1>🚌 Gestion des Transports (À implémenter)</h1></div>;
      default:
        return <PersonSearch />;
    }
  };

  return (
    <div className="App">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;