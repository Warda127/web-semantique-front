import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ 
  availableFilters = [], 
  selectedFilters = [], 
  onFilterChange,
  filterCounts = {}
}) => {
  const entityTypes = [
    { id: 'Person', label: 'Person', color: '#007bff' },
    { id: 'Station', label: 'Station', color: '#28a745' },
    { id: 'TransportMode', label: 'Transport Mode', color: '#ffc107' },
    { id: 'Trip', label: 'Trip', color: '#17a2b8' },
    { id: 'Route', label: 'Route', color: '#6f42c1' },
    { id: 'Schedule', label: 'Schedule', color: '#fd7e14' }
  ];

  const handleFilterToggle = (filterId) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId];
    
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3 className="filter-title">Filter by Type</h3>
        {hasActiveFilters && (
          <button 
            onClick={handleClearAll}
            className="clear-all-button"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="filter-list">
        {entityTypes.map((entityType) => {
          const isSelected = selectedFilters.includes(entityType.id);
          const count = filterCounts[entityType.id] || 0;
          const isAvailable = availableFilters.length === 0 || availableFilters.includes(entityType.id);
          
          return (
            <label 
              key={entityType.id}
              className={`filter-item ${!isAvailable ? 'disabled' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleFilterToggle(entityType.id)}
                disabled={!isAvailable}
                className="filter-checkbox"
                aria-describedby={`${entityType.id}-count`}
              />
              <span 
                className="filter-indicator"
                style={{ backgroundColor: isSelected ? entityType.color : 'transparent' }}
              />
              <span className="filter-label">{entityType.label}</span>
              <span 
                id={`${entityType.id}-count`}
                className="filter-count"
                aria-label={`${count} results`}
              >
                ({count})
              </span>
            </label>
          );
        })}
      </div>
      
      {hasActiveFilters && (
        <div className="active-filters-summary">
          <span className="summary-text">
            {selectedFilters.length} filter{selectedFilters.length !== 1 ? 's' : ''} active
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;