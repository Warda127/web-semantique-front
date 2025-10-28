import React from 'react';
import EntityCard from './EntityCard';
import './SearchResults.css';

const SearchResults = ({ 
  results = [], 
  onEntitySelect, 
  selectedEntity = null,
  isLoading = false,
  searchQuery = '',
  hasSearched = false,
  error = null
}) => {
  const handleEntitySelect = (entity) => {
    onEntitySelect(entity);
  };

  if (isLoading) {
    return (
      <div className="search-results">
        <div className="loading-state">
          <div className="loading-spinner" aria-hidden="true" />
          <span>Searching ontology...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results">
        <div className="error-state">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <h3>Search Error</h3>
          <p>{error}</p>
          <button 
            className="retry-search-button"
            onClick={() => window.location.reload()}
          >
            Retry Search
          </button>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="search-results">
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">🔍</div>
          <h3>Search Ontology Concepts</h3>
          <p>Enter a search term to explore entities and relationships in the WebSemEsprit ontology.</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="no-results-state">
          <div className="no-results-icon" aria-hidden="true">📭</div>
          <h3>No results found</h3>
          <p>
            No entities found for "<strong>{searchQuery}</strong>".
          </p>
          <div className="search-suggestions">
            <p>Try:</p>
            <ul>
              <li>Using different keywords</li>
              <li>Checking your spelling</li>
              <li>Using broader search terms</li>
              <li>Adjusting your filters</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h3 className="results-title">
          Search Results
        </h3>
        <span className="results-count">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="results-list" role="list">
        {results.map((entity) => (
          <div key={entity.id} role="listitem">
            <EntityCard
              entity={entity}
              onSelect={handleEntitySelect}
              isSelected={selectedEntity && selectedEntity.id === entity.id}
            />
          </div>
        ))}
      </div>
      
      {results.length > 10 && (
        <div className="results-footer">
          <p className="results-note">
            Showing {results.length} results. Select an entity to visualize its relationships.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;