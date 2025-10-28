import React, { useState, useEffect, useCallback } from 'react';
import SearchContainer from './SearchContainer';
import VisualizationContainer from './VisualizationContainer';
import { OntologyProviders, useSearch, useVisualization } from '../../contexts';
import { OntologyErrorBoundaries } from '../errorBoundaries';
import './OntologySearch.css';

// Main container component that wires up search and visualization
const OntologySearchContainer = () => {
  const {
    selectedEntity,
    setSelectedEntity,
    results,
    isLoading: searchLoading,
    error: searchError
  } = useSearch();

  const {
    setGraphData,
    setSelectedNode,
    isGraphLoading,
    isTreeLoading,
    graphError,
    treeError,
    clearVisualization
  } = useVisualization();

  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  // Initialize application data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppLoading(true);
        setAppError(null);

        // Simulate initialization delay (in real app, this would load RDF data)
        const delay = process.env.NODE_ENV === 'test' ? 100 : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Initialize any required data structures
        // In a real implementation, this would:
        // 1. Load and parse the RDF ontology file
        // 2. Build search indices
        // 3. Prepare hierarchy data
        
        setAppLoading(false);
      } catch (error) {
        console.error('Failed to initialize ontology search:', error);
        setAppError(error.message);
        setAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle entity selection from search results
  const handleEntitySelect = useCallback((entity) => {
    setSelectedEntity(entity);
    setSelectedNode(entity);

    // Generate related entities and relationships for visualization
    if (entity) {
      const mockRelatedEntities = [
        entity,
        {
          id: `related_${entity.id}_1`,
          label: `Related to ${entity.label}`,
          type: entity.type,
          properties: {},
          relationships: []
        }
      ];

      const mockRelationships = [
        {
          id: `rel_${entity.id}_1`,
          source: entity.id,
          target: `related_${entity.id}_1`,
          type: 'relatedTo',
          label: 'related to'
        }
      ];

      // Update visualization data
      setGraphData({
        nodes: mockRelatedEntities.map(e => ({
          id: e.id,
          label: e.label,
          group: e.type,
          color: getEntityColor(e.type),
          size: 20,
          font: { size: 14 },
          metadata: e
        })),
        edges: mockRelationships.map(r => ({
          id: r.id,
          from: r.source,
          to: r.target,
          label: r.label,
          arrows: 'to',
          color: '#666666'
        }))
      });
    } else {
      clearVisualization();
    }
  }, [setSelectedEntity, setSelectedNode, setGraphData, clearVisualization]);

  // Handle node selection from visualization
  const handleNodeSelect = useCallback((entity) => {
    setSelectedEntity(entity);
    setSelectedNode(entity);
  }, [setSelectedEntity, setSelectedNode]);

  // Get color for entity type
  const getEntityColor = (type) => {
    const colors = {
      'Person': '#4CAF50',
      'Station': '#2196F3',
      'TransportMode': '#FF9800',
      'Trip': '#9C27B0',
      'Route': '#F44336',
      'Schedule': '#607D8B'
    };
    return colors[type] || '#9E9E9E';
  };

  // Prepare fallback data for error boundaries
  const fallbackData = {
    entities: results || [],
    relationships: [],
    selectedEntity
  };

  // Show loading state during app initialization
  if (appLoading) {
    return (
      <div className="ontology-search">
        <div className="ontology-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h3>Loading Ontology Search</h3>
          <p>Initializing search engine and visualization components...</p>
        </div>
      </div>
    );
  }

  // Show error state if app failed to initialize
  if (appError) {
    return (
      <div className="ontology-search">
        <div className="ontology-error">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3>Failed to Load Ontology Search</h3>
          <p>{appError}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isLoading = searchLoading || isGraphLoading || isTreeLoading;
  const hasError = searchError || graphError || treeError;

  return (
    <OntologyErrorBoundaries fallbackData={fallbackData}>
      <div className="ontology-search">
        {/* Global loading indicator */}
        {isLoading && (
          <div className="global-loading-indicator">
            <div className="loading-bar"></div>
          </div>
        )}

        {/* Global error indicator */}
        {hasError && (
          <div className="global-error-indicator">
            <span className="error-text">
              {searchError || graphError || treeError}
            </span>
            <button 
              className="dismiss-error"
              onClick={() => {
                // Clear errors would be implemented here
                console.log('Dismiss error clicked');
              }}
            >
              ×
            </button>
          </div>
        )}

        <div className="ontology-search-grid">
          <div className="search-panel">
            <SearchContainer
              onEntitySelect={handleEntitySelect}
              selectedEntity={selectedEntity}
            />
          </div>
          
          <div className="visualization-panel">
            <VisualizationContainer
              selectedEntity={selectedEntity}
              onNodeSelect={handleNodeSelect}
            />
          </div>
        </div>
      </div>
    </OntologyErrorBoundaries>
  );
};

// Main component with providers
const OntologySearch = () => {
  return (
    <OntologyProviders>
      <OntologySearchContainer />
    </OntologyProviders>
  );
};

export default OntologySearch;