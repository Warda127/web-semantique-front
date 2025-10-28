import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Network } from 'vis-network';
import './GraphVisualization.css';

const GraphVisualization = ({
  selectedEntity,
  relatedEntities = [],
  relationships = [],
  onNodeSelect,
  maxNodes = 20
}) => {
  const networkRef = useRef(null);
  const networkInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [networkStats, setNetworkStats] = useState({ scale: 1, position: { x: 0, y: 0 } });

  // Entity type colors matching EntityCard component
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

  // Transform entities to vis-network nodes format
  const transformToNodes = useCallback((entities, selectedEntityId) => {
    return entities.slice(0, maxNodes).map(entity => ({
      id: entity.id,
      label: entity.label,
      title: `${entity.type}: ${entity.label}${entity.subType ? ` (${entity.subType})` : ''}`,
      group: entity.type,
      color: {
        background: getEntityTypeColor(entity.type),
        border: selectedEntityId === entity.id ? '#000000' : '#2B7CE9',
        highlight: {
          background: getEntityTypeColor(entity.type),
          border: '#000000'
        }
      },
      size: selectedEntityId === entity.id ? 30 : 20,
      font: {
        size: selectedEntityId === entity.id ? 16 : 14,
        color: '#ffffff'
      },
      borderWidth: selectedEntityId === entity.id ? 3 : 1,
      metadata: entity
    }));
  }, [maxNodes]);

  // Transform relationships to vis-network edges format
  const transformToEdges = useCallback((relationships, entityIds) => {
    return relationships
      .filter(rel => entityIds.has(rel.source) && entityIds.has(rel.target))
      .map(rel => ({
        id: rel.id,
        from: rel.source,
        to: rel.target,
        label: rel.label || rel.type,
        title: `${rel.type}: ${rel.label || 'Relationship'}`,
        arrows: 'to',
        color: {
          color: '#848484',
          highlight: '#000000'
        },
        font: {
          size: 12,
          color: '#343434'
        },
        smooth: {
          type: 'continuous'
        }
      }));
  }, []);

  // Network options for vis-network
  const getNetworkOptions = () => ({
    nodes: {
      shape: 'dot',
      scaling: {
        min: 10,
        max: 30
      },
      font: {
        size: 14,
        face: 'Tahoma'
      }
    },
    edges: {
      width: 2,
      color: { inherit: 'from' },
      smooth: {
        type: 'continuous'
      }
    },
    physics: {
      enabled: true,
      stabilization: { iterations: 100 },
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 0.1
      }
    },
    interaction: {
      hover: true,
      hoverConnectedEdges: true,
      selectConnectedEdges: false,
      tooltipDelay: 200
    },
    layout: {
      improvedLayout: true
    }
  });

  // Memoize the network data to prevent unnecessary recalculations
  const networkData = useMemo(() => {
    if (!selectedEntity) return { nodes: [], edges: [] };

    // Prepare entities for visualization (selected + related)
    const allEntities = [selectedEntity, ...relatedEntities];
    const entityIds = new Set(allEntities.map(e => e.id));

    // Transform data
    const nodes = transformToNodes(allEntities, selectedEntity.id);
    const edges = transformToEdges(relationships, entityIds);

    return { nodes, edges };
  }, [selectedEntity, relatedEntities, relationships, transformToNodes, transformToEdges]);

  // Initialize or update the network
  useEffect(() => {
    if (!networkRef.current || !selectedEntity) {
      return;
    }

    setIsLoading(true);

    try {
      const options = getNetworkOptions();

      // Destroy existing network if it exists
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      // Create new network
      networkInstance.current = new Network(networkRef.current, networkData, options);

      // Add event listeners
      networkInstance.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNodeId(nodeId);

          // Highlight selected node and connected edges
          // const connectedNodes = networkInstance.current.getConnectedNodes(nodeId);
          const connectedEdges = networkInstance.current.getConnectedEdges(nodeId);

          networkInstance.current.selectNodes([nodeId]);
          networkInstance.current.selectEdges(connectedEdges);

          const node = networkData.nodes.find(n => n.id === nodeId);
          if (node && onNodeSelect) {
            onNodeSelect(node.metadata);
          }
        } else {
          // Clicked on empty space - clear selection
          setSelectedNodeId(null);
          networkInstance.current.unselectAll();
        }
      });

      networkInstance.current.on('hoverNode', (params) => {
        networkRef.current.style.cursor = 'pointer';

        // Highlight connected nodes and edges on hover
        // const connectedNodes = networkInstance.current.getConnectedNodes(params.node);
        // const connectedEdges = networkInstance.current.getConnectedEdges(params.node);

        // Update node colors for highlighting
        // const updateArray = [];
        // connectedNodes.forEach(nodeId => {
        //   updateArray.push({
        //     id: nodeId,
        //     color: {
        //       background: getEntityTypeColor(nodes.find(n => n.id === nodeId)?.group || 'default'),
        //       border: '#000000'
        //     }
        //   });
        // });

        // if (updateArray.length > 0) {
        //   networkInstance.current.updateCluster(updateArray);
        // }
      });

      networkInstance.current.on('blurNode', () => {
        networkRef.current.style.cursor = 'default';

        // Reset node colors when not hovering
        const updateArray = networkData.nodes.map(node => ({
          id: node.id,
          color: node.color
        }));

        networkInstance.current.updateCluster(updateArray);
      });

      // Track zoom and pan changes
      networkInstance.current.on('zoom', (params) => {
        setNetworkStats(prev => ({
          ...prev,
          scale: params.scale
        }));
      });

      networkInstance.current.on('dragEnd', (params) => {
        const position = networkInstance.current.getViewPosition();
        setNetworkStats(prev => ({
          ...prev,
          position
        }));
      });

      // Fit network to container after stabilization
      networkInstance.current.once('stabilizationIterationsDone', () => {
        networkInstance.current.fit({
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error creating network visualization:', error);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [selectedEntity, networkData, onNodeSelect]);

  // Control functions
  const handleZoomIn = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: Math.min(scale * 1.2, 3.0),
        animation: { duration: 300, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  const handleZoomOut = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: Math.max(scale * 0.8, 0.1),
        animation: { duration: 300, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  const handleFitToScreen = () => {
    if (networkInstance.current) {
      networkInstance.current.fit({
        animation: { duration: 500, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  const handleCenterView = () => {
    if (networkInstance.current) {
      networkInstance.current.moveTo({
        position: { x: 0, y: 0 },
        animation: { duration: 500, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  const togglePhysics = () => {
    if (networkInstance.current) {
      const newPhysicsState = !physicsEnabled;
      setPhysicsEnabled(newPhysicsState);
      networkInstance.current.setOptions({
        physics: { enabled: newPhysicsState }
      });
    }
  };

  const handleStabilize = () => {
    if (networkInstance.current) {
      networkInstance.current.stabilize();
    }
  };

  if (!selectedEntity) {
    return (
      <div className="graph-visualization">
        <div className="graph-empty-state">
          <div className="empty-icon" aria-hidden="true">🔗</div>
          <h3>Graph Visualization</h3>
          <p>Select an entity from search results to visualize its relationships.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-visualization">
      <div className="graph-header">
        <h3 className="graph-title">
          Relationship Graph: {selectedEntity.label}
        </h3>
        <div className="graph-info">
          <span className="node-count">
            {Math.min(1 + relatedEntities.length, maxNodes)} nodes
          </span>
          <span className="relationship-count">
            {relationships.length} relationships
          </span>
        </div>
      </div>

      <div className="graph-container">
        {isLoading && (
          <div className="graph-loading">
            <div className="loading-spinner" aria-hidden="true" />
            <span>Building graph...</span>
          </div>
        )}
        <div
          ref={networkRef}
          className="graph-network"
          style={{
            width: '100%',
            height: '400px',
            opacity: isLoading ? 0.5 : 1
          }}
        />
      </div>

      <div className="graph-legend">
        <h4>Entity Types</h4>
        <div className="legend-items">
          {['Person', 'Station', 'TransportMode', 'Trip', 'Route', 'Schedule'].map(type => (
            <div key={type} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: getEntityTypeColor(type) }}
                aria-hidden="true"
              />
              <span className="legend-label">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="graph-controls">
        <div className="control-buttons">
          <button
            className="control-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom in"
          >
            🔍+
          </button>
          <button
            className="control-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            🔍-
          </button>
          <button
            className="control-btn"
            onClick={handleFitToScreen}
            title="Fit to Screen"
            aria-label="Fit graph to screen"
          >
            ⊞
          </button>
          <button
            className="control-btn"
            onClick={handleCenterView}
            title="Center View"
            aria-label="Center view"
          >
            ⊙
          </button>
          <button
            className={`control-btn ${physicsEnabled ? 'active' : ''}`}
            onClick={togglePhysics}
            title={physicsEnabled ? 'Disable Physics' : 'Enable Physics'}
            aria-label={physicsEnabled ? 'Disable physics simulation' : 'Enable physics simulation'}
          >
            ⚡
          </button>
          <button
            className="control-btn"
            onClick={handleStabilize}
            title="Stabilize Layout"
            aria-label="Stabilize graph layout"
          >
            ⚖️
          </button>
        </div>

        <div className="graph-status">
          <span className="status-item">
            Zoom: {Math.round(networkStats.scale * 100)}%
          </span>
          {selectedNodeId && selectedEntity && (
            <span className="status-item">
              Selected: {selectedNodeId === selectedEntity.id ? selectedEntity.label :
                relatedEntities.find(e => e.id === selectedNodeId)?.label || 'Unknown'}
            </span>
          )}
        </div>

        <p className="graph-instructions">
          Click nodes to select • Drag to pan • Scroll to zoom • Hover for highlights
        </p>
      </div>
    </div>
  );
};

export default GraphVisualization;