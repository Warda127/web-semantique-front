import React, { useState, useEffect } from 'react';
import GraphVisualization from './GraphVisualization';
import HierarchyTree from './HierarchyTree';
import { useVisualization } from '../../contexts';
import './VisualizationContainer.css';

const VisualizationContainer = ({ selectedEntity, onNodeSelect }) => {
  const {
    treeData,
    viewMode,
    isGraphLoading,
    isTreeLoading,
    graphError,
    treeError,
    setViewMode,
    setTreeData,
    setGraphLoading,
    setTreeLoading,
    setGraphError,
    setTreeError
  } = useVisualization();

  const [relatedEntities, setRelatedEntities] = useState([]);
  const [relationships, setRelationships] = useState([]);

  // Mock related entities and relationships
  const mockRelatedEntities = [
    {
      id: 'station_2',
      label: 'Bus Station B',
      type: 'Station',
      subType: 'BusStation',
      properties: { hasCapacity: 500 },
      relationships: []
    },
    {
      id: 'route_1',
      label: 'Route 101',
      type: 'Route',
      properties: { hasLength: 15.5 },
      relationships: []
    }
  ];

  const mockRelationships = [
    {
      id: 'rel_1',
      source: selectedEntity?.id || '',
      target: 'station_2',
      type: 'connectsTo',
      label: 'connects to'
    },
    {
      id: 'rel_2',
      source: selectedEntity?.id || '',
      target: 'route_1',
      type: 'usesRoute',
      label: 'uses route'
    }
  ];

  const mockHierarchyData = {
    name: 'owl:Thing',
    children: [
      {
        name: 'Person',
        children: [
          { name: 'Citizen' },
          { name: 'Staff' },
          { name: 'Tourist' }
        ]
      },
      {
        name: 'Station',
        children: [
          { name: 'BikeStation' },
          { name: 'BusStation' },
          { name: 'MetroStation' }
        ]
      },
      {
        name: 'TransportMode',
        children: [
          { name: 'Bike' },
          { name: 'Bus' },
          { name: 'Metro' }
        ]
      }
    ]
  };

  useEffect(() => {
    if (selectedEntity) {
      setGraphLoading(true);
      setTreeLoading(true);
      setGraphError(null);
      setTreeError(null);
      
      // Simulate loading related entities
      setTimeout(() => {
        try {
          setRelatedEntities(mockRelatedEntities);
          setRelationships(mockRelationships);
          setTreeData(mockHierarchyData);
          setGraphLoading(false);
          setTreeLoading(false);
        } catch (error) {
          setGraphError(error.message);
          setTreeError(error.message);
          setGraphLoading(false);
          setTreeLoading(false);
        }
      }, 300);
    } else {
      setRelatedEntities([]);
      setRelationships([]);
    }
  }, [selectedEntity, setGraphLoading, setTreeLoading, setGraphError, setTreeError, setTreeData, mockRelatedEntities, mockRelationships, mockHierarchyData]);

  const handleViewChange = (view) => {
    setViewMode(view);
  };

  const handleNodeSelect = (entity) => {
    if (onNodeSelect) {
      onNodeSelect(entity);
    }
  };

  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2 className="visualization-title">Visualization</h2>
        <div className="view-tabs">
          <button
            className={`tab-button ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => handleViewChange('graph')}
            aria-pressed={viewMode === 'graph'}
          >
            <span className="tab-icon">🔗</span>
            Graph
          </button>
          <button
            className={`tab-button ${viewMode === 'hierarchy' ? 'active' : ''}`}
            onClick={() => handleViewChange('hierarchy')}
            aria-pressed={viewMode === 'hierarchy'}
          >
            <span className="tab-icon">🌳</span>
            Hierarchy
          </button>
        </div>
      </div>
      
      <div className="visualization-content">
        {viewMode === 'graph' && (
          <GraphVisualization
            selectedEntity={selectedEntity}
            relatedEntities={relatedEntities}
            relationships={relationships}
            onNodeSelect={handleNodeSelect}
            maxNodes={20}
            isLoading={isGraphLoading}
            error={graphError}
          />
        )}
        
        {viewMode === 'hierarchy' && (
          <HierarchyTree
            treeData={treeData}
            selectedEntity={selectedEntity}
            onNodeSelect={handleNodeSelect}
            isLoading={isTreeLoading}
            error={treeError}
          />
        )}
      </div>
    </div>
  );
};

export default VisualizationContainer;