import React, { useEffect, useState, useMemo } from 'react';
import { TransportModeService } from '../services/transportModeService';
import { filterModes } from '../utils/transportUtils';

export default function TransportModeList({ onSelect, debug = false }) {
  const [modes, setModes] = useState([]);
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'id', dir: 'asc' });

  async function load(debugFlag = false) {
    setLoading(true);
    setError(null);
    try {
      const { modes, raw } = await TransportModeService.getAllModes(debugFlag);
      console.debug('[TransportModeList] received', { count: modes?.length, raw });
      setModes(modes || []);
      setRaw(raw);
    } catch (err) {
      console.error('[TransportModeList] fetch error', err);
      setError(err);
      setModes([]);
      setRaw(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    // prefer component-level debug prop if present, otherwise normal load
    if (mounted) load(debug);
    return () => { mounted = false; };
  }, [debug]);

  const filtered = useMemo(() => {
    const f = filterModes(modes, query);
    const sorted = [...f].sort((a, b) => {
      const av = a[sortBy.key];
      const bv = b[sortBy.key];
      if (av == null && bv == null) return 0;
      if (av == null) return sortBy.dir === 'asc' ? -1 : 1;
      if (bv == null) return sortBy.dir === 'asc' ? 1 : -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortBy.dir === 'asc' ? av - bv : bv - av;
      }
      return sortBy.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }, [modes, query, sortBy]);

  function toggleSort(key) {
    setSortBy(s => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  return (
    <div className="transport-mode-list">
      <div className="toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="Search by id, type, speed or use numeric compare like '> 10'"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => load(false)} style={{ padding: '6px 10px' }}>Refresh</button>
        <button onClick={() => load(true)} style={{ padding: '6px 10px' }}>Retry with debug</button>
      </div>

      {loading && <div>Loading transport modes...</div>}
      {error && <div style={{ color: 'red' }}>Failed to load transport modes: {String(error.message || error)}</div>}

      {!loading && !error && (
        <>
          {modes.length === 0 && (
            <div style={{ padding: 12, color: '#555' }}>
              No transport modes returned by the backend.
              <div style={{ marginTop: 8 }}>
                Try "Retry with debug" to request debug output from the server and see attempts below.
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
                  <th onClick={() => toggleSort('typeName')} style={{ cursor: 'pointer' }}>Type</th>
                  <th onClick={() => toggleSort('speed')} style={{ cursor: 'pointer' }}>Speed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.uri || m.id} onClick={() => {
                    console.debug('[TransportModeList] row click', m);
                    onSelect && onSelect(m);
                  }} style={{ cursor: 'pointer' }}>
                    <td>{m.id}</td>
                    <td>{m.typeName}</td>
                    <td>{m.speed != null ? m.speed : ''}</td>
                  </tr>
                ))}
                {filtered.length === 0 && modes.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: 12 }}>No transport modes found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* debug raw payload and attempts */}
      {raw && (
        <details style={{ marginTop: 12 }}>
          <summary>Debug: attempts & payload</summary>
          <div style={{ marginTop: 8 }}>
            {Array.isArray(raw.attempts) && raw.attempts.map((a, i) => (
              <div key={i} style={{ marginBottom: 10, padding: 8, border: '1px solid #eee', borderRadius: 4 }}>
                <div><strong>Attempt #{i + 1}</strong></div>
                <div style={{ fontSize: 12, color: '#666' }}>{a.url}</div>
                <div style={{ marginTop: 6 }}>
                  {a.payload ? (
                    <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(a.payload, null, 2)}</pre>
                  ) : (
                    <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(a.error || 'No payload', null, 2)}</pre>
                  )}
                </div>
              </div>
            ))}
            {raw.payload && !raw.attempts && (
              <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(raw.payload, null, 2)}</pre>
            )}
          </div>
        </details>
      )}
    </div>
  );
}