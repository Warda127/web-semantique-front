import React, { useEffect, useState, useMemo } from 'react';
import { TravelPlanService } from '../services/travelPlanService';
import { filterPlans } from '../utils/travelPlanUtils';

export default function TravelPlanList({ onSelect, debug = false }) {
  const [plans, setPlans] = useState([]);
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'id', dir: 'asc' });

  async function load(debugFlag = false) {
    setLoading(true);
    setError(null);
    try {
      const { plans, raw } = await TravelPlanService.getAllPlans(debugFlag);
      console.debug('[TravelPlanList] received', { count: plans?.length, raw });
      setPlans(plans || []);
      setRaw(raw);
    } catch (err) {
      console.error('[TravelPlanList] fetch error', err);
      setError(err);
      setPlans([]);
      setRaw(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    // prefer component-level debug prop if present, otherwise normal load
    if (mounted) load(debug);
    return () => {
      mounted = false;
    };
  }, [debug]);

  const filtered = useMemo(() => {
    const f = filterPlans(plans, query);
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
  }, [plans, query, sortBy]);

  function toggleSort(key) {
    setSortBy((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  return (
    <div className="travel-plan-list">
      <div
        className="toolbar"
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <input
          placeholder="Search by person, station, transport mode, days..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => load(false)} style={{ padding: '6px 10px' }}>
          Refresh
        </button>
        <button onClick={() => load(true)} style={{ padding: '6px 10px' }}>
          Retry with debug
        </button>
      </div>

      {loading && <div>Loading travel plans...</div>}
      {error && (
        <div style={{ color: 'red' }}>
          Failed to load travel plans: {String(error.message || error)}
        </div>
      )}

      {!loading && !error && (
        <>
          {plans.length === 0 && (
            <div style={{ padding: 12, color: '#555' }}>
              No travel plans returned by the backend.
              <div style={{ marginTop: 8 }}>
                Try "Retry with debug" to request debug output from the server
                and see attempts below.
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th
                    onClick={() => toggleSort('id')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    ID
                  </th>
                  <th
                    onClick={() => toggleSort('typeName')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    Type
                  </th>
                  <th
                    onClick={() => toggleSort('personName')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    Person
                  </th>
                  <th
                    onClick={() => toggleSort('startStationName')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    From
                  </th>
                  <th
                    onClick={() => toggleSort('endStationName')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    To
                  </th>
                  <th
                    onClick={() => toggleSort('transportModeName')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    Mode
                  </th>
                  <th
                    onClick={() => toggleSort('startTime')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    Time
                  </th>
                  <th
                    onClick={() => toggleSort('isActive')}
                    style={{ cursor: 'pointer', padding: 8, textAlign: 'left' }}
                  >
                    Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.uri || p.id}
                    onClick={() => {
                      console.debug('[TravelPlanList] row click', p);
                      onSelect && onSelect(p);
                    }}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#f5f5f5')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <td style={{ padding: 8 }}>{p.id}</td>
                    <td style={{ padding: 8 }}>{p.typeName}</td>
                    <td style={{ padding: 8 }}>{p.personName || '-'}</td>
                    <td style={{ padding: 8 }}>{p.startStationName || '-'}</td>
                    <td style={{ padding: 8 }}>{p.endStationName || '-'}</td>
                    <td style={{ padding: 8 }}>{p.transportModeName || '-'}</td>
                    <td style={{ padding: 8 }}>{p.startTime || '-'}</td>
                    <td style={{ padding: 8 }}>{p.isActive || '-'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && plans.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: 'center', padding: 12 }}
                    >
                      No travel plans found
                    </td>
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
          <div style={{ marginTop: 8 }}>
            {Array.isArray(raw.attempts) &&
              raw.attempts.map((a, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    padding: 8,
                    border: '1px solid #eee',
                    borderRadius: 4,
                  }}
                >
                  <div>
                    <strong>Attempt #{i + 1}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>{a.url}</div>
                  <div style={{ marginTop: 6 }}>
                    {a.payload ? (
                      <pre
                        style={{
                          maxHeight: 200,
                          overflow: 'auto',
                          fontSize: 11,
                        }}
                      >
                        {JSON.stringify(a.payload, null, 2)}
                      </pre>
                    ) : (
                      <pre
                        style={{
                          maxHeight: 200,
                          overflow: 'auto',
                          fontSize: 11,
                        }}
                      >
                        {JSON.stringify(a.error || 'No payload', null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            {raw.payload && !raw.attempts && (
              <pre style={{ maxHeight: 200, overflow: 'auto', fontSize: 11 }}>
                {JSON.stringify(raw.payload, null, 2)}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
