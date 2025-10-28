import React, { useState, useEffect, useMemo } from 'react';
import './HierarchyTree.css';

const HierarchyTree = ({ 
  entities = [], 
  relationships = [],
  onNodeSelect,
  selectedEntity = null 
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['owl:Thing']));
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState([]);

  // Build hierarchy tree structure from entities and relationships
  const hierarchyTree = useMemo(() => {
    // Filter class entities and subclass relationships
    const classEntities = entities.filter(entity => entity.subType === 'Class');
    const subClassRelationships = relationships.filter(rel => rel.type === 'subClassOf');
    
    // Create node map
    const nodeMap = new Map();
    
    // Add owl:Thing as root
    nodeMap.set('owl:Thing', {
      id: 'owl:Thing',
      label: 'Thing',
      type: 'Root',
      children: [],
      parent: null,
      entity: null
    });
    
    // Add class entities as nodes
    classEntities.forEach(entity => {
      nodeMap.set(entity.id, {
        id: entity.id,
        label: entity.label,
        type: entity.type,
        children: [],
        parent: null,
        entity: entity
      });
    });
    
    // Build parent-child relationships
    subClassRelationships.forEach(rel => {
      const childNode = nodeMap.get(rel.source);
      const parentNode = nodeMap.get(rel.target);
      
      if (childNode && parentNode) {
        childNode.parent = parentNode.id;
        parentNode.children.push(childNode);
      }
    });
    
    // Add orphaned classes to owl:Thing
    const rootNode = nodeMap.get('owl:Thing');
    nodeMap.forEach(node => {
      if (node.id !== 'owl:Thing' && !node.parent) {
        node.parent = 'owl:Thing';
        rootNode.children.push(node);
      }
    });
    
    // Sort children alphabetically
    const sortChildren = (node) => {
      node.children.sort((a, b) => a.label.localeCompare(b.label));
      node.children.forEach(sortChildren);
    };
    
    sortChildren(rootNode);
    
    return rootNode;
  }, [entities, relationships]);

  // Find path from root to a specific node
  const findPathToNode = (nodeId, currentNode = hierarchyTree, path = []) => {
    const currentPath = [...path, currentNode.id];
    
    if (currentNode.id === nodeId) {
      return currentPath;
    }
    
    for (const child of currentNode.children) {
      const foundPath = findPathToNode(nodeId, child, currentPath);
      if (foundPath) {
        return foundPath;
      }
    }
    
    return null;
  };

  // Handle node expansion/collapse
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  };

  // Handle node selection
  const handleNodeSelect = (node) => {
    setSelectedNodeId(node.id);
    
    if (node.entity && onNodeSelect) {
      onNodeSelect(node.entity);
    }
    
    // Highlight path from root to selected node
    const path = findPathToNode(node.id);
    setHighlightedPath(path || []);
  };

  // Expand path to selected entity when it changes
  useEffect(() => {
    if (selectedEntity) {
      const path = findPathToNode(selectedEntity.id);
      if (path) {
        setExpandedNodes(prev => {
          const newExpanded = new Set(prev);
          path.forEach(nodeId => newExpanded.add(nodeId));
          return newExpanded;
        });
        setSelectedNodeId(selectedEntity.id);
        setHighlightedPath(path);
      }
    }
  }, [selectedEntity, hierarchyTree, findPathToNode]);

  // Expand all nodes
  const expandAll = () => {
    const allNodeIds = new Set();
    
    const collectNodeIds = (node) => {
      allNodeIds.add(node.id);
      node.children.forEach(collectNodeIds);
    };
    
    collectNodeIds(hierarchyTree);
    setExpandedNodes(allNodeIds);
  };

  // Collapse all nodes except root
  const collapseAll = () => {
    setExpandedNodes(new Set(['owl:Thing']));
  };

  // Render tree node
  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const isHighlighted = highlightedPath.includes(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="tree-node-container">
        <div 
          className={`tree-node ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => handleNodeSelect(node)}
        >
          <div className="node-content">
            {hasChildren && (
              <button
                className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <div className="expand-spacer" />}
            
            <div className="node-info">
              <div className="node-label">{node.label}</div>
              <div className="node-type">{node.type}</div>
            </div>
            
            {node.entity && (
              <div 
                className="node-type-indicator"
                style={{ backgroundColor: getEntityTypeColor(node.type) }}
                title={node.type}
              />
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get entity type color (matching other components)
  const getEntityTypeColor = (type) => {
    const colors = {
      'Person': '#007bff',
      'Station': '#28a745',
      'TransportMode': '#ffc107',
      'Trip': '#17a2b8',
      'Route': '#6f42c1',
      'Schedule': '#fd7e14',
      'Root': '#6c757d'
    };
    return colors[type] || '#6c757d';
  };

  if (!hierarchyTree || hierarchyTree.children.length === 0) {
    return (
      <div className="hierarchy-tree">
        <div className="tree-empty-state">
          <div className="empty-icon" aria-hidden="true">🌳</div>
          <h3>Class Hierarchy</h3>
          <p>No class hierarchy available in the current ontology.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hierarchy-tree">
      <div className="tree-header">
        <h3 className="tree-title">Ontology Class Hierarchy</h3>
        <div className="tree-controls">
          <button 
            className="tree-control-btn"
            onClick={expandAll}
            title="Expand All"
            aria-label="Expand all nodes"
          >
            ⊞
          </button>
          <button 
            className="tree-control-btn"
            onClick={collapseAll}
            title="Collapse All"
            aria-label="Collapse all nodes"
          >
            ⊟
          </button>
        </div>
      </div>
      
      <div className="tree-content">
        {renderNode(hierarchyTree)}
      </div>
      
      {highlightedPath.length > 0 && (
        <div className="tree-breadcrumb">
          <h4>Inheritance Path:</h4>
          <div className="breadcrumb-path">
            {highlightedPath.map((nodeId, index) => (
              <React.Fragment key={nodeId}>
                <span className="breadcrumb-item">
                  {nodeId === 'owl:Thing' ? 'Thing' : 
                   entities.find(e => e.id === nodeId)?.label || nodeId}
                </span>
                {index < highlightedPath.length - 1 && (
                  <span className="breadcrumb-separator">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      <div className="tree-info">
        <p className="tree-instructions">
          Click to select • {expandedNodes.size - 1} of {getTotalNodeCount(hierarchyTree) - 1} classes expanded
        </p>
      </div>
    </div>
  );
};

// Helper function to count total nodes
const getTotalNodeCount = (node) => {
  return 1 + node.children.reduce((sum, child) => sum + getTotalNodeCount(child), 0);
};

export default HierarchyTree;