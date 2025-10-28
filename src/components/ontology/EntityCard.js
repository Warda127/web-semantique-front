import React from 'react';
import './EntityCard.css';

const EntityCard = ({ entity, onSelect, isSelected = false }) => {
  const getEntityTypeColor = (type) => {
    const colors = {
      'Person': '#007bff',
      'Station': '#28a745',
      'TransportMode': '#ffc107',
      'Trip': '#17a2b8',
      'Route': '#6f42c1',
      'Schedule': '#fd7e14'
    };
    return colors[type] || '#6c757d';
  };

  const handleClick = () => {
    onSelect(entity);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(entity);
    }
  };

  // Extract key properties for display
  const displayProperties = Object.entries(entity.properties || {})
    .slice(0, 3) // Limit to first 3 properties
    .filter(([key, value]) => value && key !== 'label' && key !== 'type');

  return (
    <div 
      className={`entity-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Select ${entity.label} (${entity.type})`}
    >
      <div className="entity-header">
        <div 
          className="entity-type-indicator"
          style={{ backgroundColor: getEntityTypeColor(entity.type) }}
          aria-hidden="true"
        />
        <div className="entity-main-info">
          <h4 className="entity-label">{entity.label}</h4>
          <span className="entity-type">{entity.type}</span>
          {entity.subType && (
            <span className="entity-subtype">({entity.subType})</span>
          )}
        </div>
      </div>
      
      {displayProperties.length > 0 && (
        <div className="entity-properties">
          {displayProperties.map(([key, value]) => (
            <div key={key} className="property-item">
              <span className="property-key">{key}:</span>
              <span className="property-value">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
      
      {entity.relationships && entity.relationships.length > 0 && (
        <div className="entity-relationships">
          <span className="relationships-count">
            {entity.relationships.length} relationship{entity.relationships.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default EntityCard;