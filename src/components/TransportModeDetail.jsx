import React from 'react';

export default function TransportModeDetail({ mode, showDebug = false }) {
  if (!mode) {
    console.debug('[TransportModeDetail] no mode provided');
    return <div>No transport selected</div>;
  }

  console.debug('[TransportModeDetail] rendering mode', mode);

  return (
    <div className="transport-mode-detail" style={{ padding: 12 }}>
      <h3>{mode.id || '(no id)'}</h3>
      <div><strong>URI:</strong> <span style={{ wordBreak: 'break-all' }}>{mode.uri || '(empty)'}</span></div>
      <div><strong>Type:</strong> {mode.typeName || '(unknown)'} <small>({mode.type || '-'})</small></div>
      <div><strong>Name:</strong> {mode.name ?? '-'}</div>
      <div><strong>Speed:</strong> {mode.speed != null ? mode.speed : (mode.speedRaw ?? '-')}</div>

      <div style={{ marginTop: 8 }}>
        <strong>All properties (raw):</strong>
        <pre style={{ maxHeight: 260, overflow: 'auto' }}>{JSON.stringify(mode._raw || mode, null, 2)}</pre>
      </div>

      {showDebug && (
        <div style={{ marginTop: 8 }}>
          <strong>Debug:</strong>
          <pre style={{ maxHeight: 200, overflow: 'auto' }}>
            {JSON.stringify({
              id: mode.id,
              uri: mode.uri,
              type: mode.type,
              typeName: mode.typeName,
              speedRaw: mode.speedRaw,
              speed: mode.speed
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
