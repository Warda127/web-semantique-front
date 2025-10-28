import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialVisualizationState = {
  graphData: {
    nodes: [],
    edges: []
  },
  treeData: null,
  selectedNode: null,
  expandedNodes: [],
  graphOptions: {
    physics: {
      enabled: true,
      stabilization: { iterations: 100 }
    },
    layout: {
      improvedLayout: true
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true
    }
  },
  treeOptions: {
    showRoot: true,
    expandedByDefault: false
  },
  isGraphLoading: false,
  isTreeLoading: false,
  graphError: null,
  treeError: null,
  viewMode: 'graph' // 'graph' or 'tree'
};

// Action types
export const VISUALIZATION_ACTIONS = {
  SET_GRAPH_DATA: 'SET_GRAPH_DATA',
  SET_TREE_DATA: 'SET_TREE_DATA',
  SET_SELECTED_NODE: 'SET_SELECTED_NODE',
  SET_EXPANDED_NODES: 'SET_EXPANDED_NODES',
  TOGGLE_NODE_EXPANSION: 'TOGGLE_NODE_EXPANSION',
  SET_GRAPH_OPTIONS: 'SET_GRAPH_OPTIONS',
  SET_TREE_OPTIONS: 'SET_TREE_OPTIONS',
  SET_GRAPH_LOADING: 'SET_GRAPH_LOADING',
  SET_TREE_LOADING: 'SET_TREE_LOADING',
  SET_GRAPH_ERROR: 'SET_GRAPH_ERROR',
  SET_TREE_ERROR: 'SET_TREE_ERROR',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  CLEAR_VISUALIZATION: 'CLEAR_VISUALIZATION'
};

// Reducer function
const visualizationReducer = (state, action) => {
  switch (action.type) {
    case VISUALIZATION_ACTIONS.SET_GRAPH_DATA:
      return {
        ...state,
        graphData: action.payload,
        isGraphLoading: false,
        graphError: null
      };
    
    case VISUALIZATION_ACTIONS.SET_TREE_DATA:
      return {
        ...state,
        treeData: action.payload,
        isTreeLoading: false,
        treeError: null
      };
    
    case VISUALIZATION_ACTIONS.SET_SELECTED_NODE:
      return { ...state, selectedNode: action.payload };
    
    case VISUALIZATION_ACTIONS.SET_EXPANDED_NODES:
      return { ...state, expandedNodes: action.payload };
    
    case VISUALIZATION_ACTIONS.TOGGLE_NODE_EXPANSION:
      const nodeId = action.payload;
      const isExpanded = state.expandedNodes.includes(nodeId);
      const newExpandedNodes = isExpanded
        ? state.expandedNodes.filter(id => id !== nodeId)
        : [...state.expandedNodes, nodeId];
      return { ...state, expandedNodes: newExpandedNodes };
    
    case VISUALIZATION_ACTIONS.SET_GRAPH_OPTIONS:
      return {
        ...state,
        graphOptions: { ...state.graphOptions, ...action.payload }
      };
    
    case VISUALIZATION_ACTIONS.SET_TREE_OPTIONS:
      return {
        ...state,
        treeOptions: { ...state.treeOptions, ...action.payload }
      };
    
    case VISUALIZATION_ACTIONS.SET_GRAPH_LOADING:
      return { ...state, isGraphLoading: action.payload };
    
    case VISUALIZATION_ACTIONS.SET_TREE_LOADING:
      return { ...state, isTreeLoading: action.payload };
    
    case VISUALIZATION_ACTIONS.SET_GRAPH_ERROR:
      return {
        ...state,
        graphError: action.payload,
        isGraphLoading: false
      };
    
    case VISUALIZATION_ACTIONS.SET_TREE_ERROR:
      return {
        ...state,
        treeError: action.payload,
        isTreeLoading: false
      };
    
    case VISUALIZATION_ACTIONS.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload };
    
    case VISUALIZATION_ACTIONS.CLEAR_VISUALIZATION:
      return {
        ...state,
        graphData: { nodes: [], edges: [] },
        treeData: null,
        selectedNode: null,
        graphError: null,
        treeError: null
      };
    
    default:
      return state;
  }
};

// Create context
const VisualizationContext = createContext();

// Custom hook to use visualization context
export const useVisualization = () => {
  const context = useContext(VisualizationContext);
  if (!context) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
};

// Provider component
export const VisualizationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(visualizationReducer, initialVisualizationState);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('ontology-visualization-preferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.graphOptions) {
          dispatch({
            type: VISUALIZATION_ACTIONS.SET_GRAPH_OPTIONS,
            payload: preferences.graphOptions
          });
        }
        if (preferences.treeOptions) {
          dispatch({
            type: VISUALIZATION_ACTIONS.SET_TREE_OPTIONS,
            payload: preferences.treeOptions
          });
        }
        if (preferences.viewMode) {
          dispatch({
            type: VISUALIZATION_ACTIONS.SET_VIEW_MODE,
            payload: preferences.viewMode
          });
        }
        if (preferences.expandedNodes) {
          dispatch({
            type: VISUALIZATION_ACTIONS.SET_EXPANDED_NODES,
            payload: preferences.expandedNodes
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load visualization preferences from localStorage:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const preferencesToSave = {
        graphOptions: state.graphOptions,
        treeOptions: state.treeOptions,
        viewMode: state.viewMode,
        expandedNodes: state.expandedNodes
      };
      localStorage.setItem('ontology-visualization-preferences', JSON.stringify(preferencesToSave));
    } catch (error) {
      console.warn('Failed to save visualization preferences to localStorage:', error);
    }
  }, [state.graphOptions, state.treeOptions, state.viewMode, state.expandedNodes]);

  // Action creators
  const actions = {
    setGraphData: (data) => dispatch({ type: VISUALIZATION_ACTIONS.SET_GRAPH_DATA, payload: data }),
    setTreeData: (data) => dispatch({ type: VISUALIZATION_ACTIONS.SET_TREE_DATA, payload: data }),
    setSelectedNode: (node) => dispatch({ type: VISUALIZATION_ACTIONS.SET_SELECTED_NODE, payload: node }),
    setExpandedNodes: (nodes) => dispatch({ type: VISUALIZATION_ACTIONS.SET_EXPANDED_NODES, payload: nodes }),
    toggleNodeExpansion: (nodeId) => dispatch({ type: VISUALIZATION_ACTIONS.TOGGLE_NODE_EXPANSION, payload: nodeId }),
    setGraphOptions: (options) => dispatch({ type: VISUALIZATION_ACTIONS.SET_GRAPH_OPTIONS, payload: options }),
    setTreeOptions: (options) => dispatch({ type: VISUALIZATION_ACTIONS.SET_TREE_OPTIONS, payload: options }),
    setGraphLoading: (loading) => dispatch({ type: VISUALIZATION_ACTIONS.SET_GRAPH_LOADING, payload: loading }),
    setTreeLoading: (loading) => dispatch({ type: VISUALIZATION_ACTIONS.SET_TREE_LOADING, payload: loading }),
    setGraphError: (error) => dispatch({ type: VISUALIZATION_ACTIONS.SET_GRAPH_ERROR, payload: error }),
    setTreeError: (error) => dispatch({ type: VISUALIZATION_ACTIONS.SET_TREE_ERROR, payload: error }),
    setViewMode: (mode) => dispatch({ type: VISUALIZATION_ACTIONS.SET_VIEW_MODE, payload: mode }),
    clearVisualization: () => dispatch({ type: VISUALIZATION_ACTIONS.CLEAR_VISUALIZATION })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <VisualizationContext.Provider value={value}>
      {children}
    </VisualizationContext.Provider>
  );
};

export default VisualizationContext;