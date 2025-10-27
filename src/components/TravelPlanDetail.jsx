import React from 'react';

export default function TravelPlanDetail({ plan, showDebug = false }) {
  if (!plan) {
    console.debug('[TravelPlanDetail] no plan provided');
    return <div>No travel plan selected</div>;
  }

  console.debug('[TravelPlanDetail] rendering plan', plan);

  return (
    <div className="travel-plan-detail" style={{ padding: 12 }}>
      <h3>Travel Plan: {plan.id || '(no id)'}</h3>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Type:</strong> {plan.typeName || '(unknown)'}{' '}
          <small>({plan.type || '-'})</small>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>URI:</strong>{' '}
          <span style={{ wordBreak: 'break-all', fontSize: 12 }}>
            {plan.uri || '(empty)'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Person</h4>
        <div>
          <strong>Name:</strong> {plan.personName || '-'}
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          <strong>URI:</strong> {plan.person || '-'}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Route</h4>
        <div>
          <strong>From:</strong> {plan.startStationName || '-'}{' '}
          <span style={{ fontSize: 12, color: '#666' }}>
            ({plan.startStation || '-'})
          </span>
        </div>
        <div>
          <strong>To:</strong> {plan.endStationName || '-'}{' '}
          <span style={{ fontSize: 12, color: '#666' }}>
            ({plan.endStation || '-'})
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Transport</h4>
        <div>
          <strong>Mode:</strong> {plan.transportModeName || '-'}
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          <strong>URI:</strong> {plan.transportMode || '-'}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Schedule</h4>
        <div>
          <strong>Start Time:</strong> {plan.startTime || '-'}
        </div>
        <div>
          <strong>End Time:</strong> {plan.endTime || '-'}
        </div>
        <div>
          <strong>Days of Week:</strong> {plan.daysOfWeek || '-'}
        </div>
        <div>
          <strong>Active:</strong> {plan.isActive || '-'}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>All properties (raw):</strong>
        <pre
          style={{
            maxHeight: 260,
            overflow: 'auto',
            fontSize: 11,
            backgroundColor: '#f5f5f5',
            padding: 8,
            borderRadius: 4,
          }}
        >
          {JSON.stringify(plan._raw || plan, null, 2)}
        </pre>
      </div>

      
    </div>
  );
}
