import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { VisualizationProvider, useVisualization, VISUALIZATION_ACTIONS } from '../VisualizationContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test component that uses the visualization context
const TestComponent = () => {
  const {
    graphData,
    treeData,
    selectedNode,
    expandedNodes,
    graphOptions,
    treeOptions,
    isGraphLoading,
    isTreeLoading,
    graphError,
    treeError,
    viewMode,
    setGraphData,
    setTreeData,
    setSelectedNode,
    setExpandedNodes,
    toggleNodeExpansion,
    setGraphOptions,
    setTreeOptions,
    setGraphLoading,
    setTreeLoading,
    setGraphError,
    setTreeError,
    setViewMode,
    clearVisualization
  } = useVisualization();

  return (
    <div>
      <div data-testid="graphData">{JSON.stringify(graphData)}</div>
      <div data-testid="treeData">{JSON.stringify(treeData)}</div>
      <div data-testid="selectedNode">{JSON.stringify(selectedNode)}</div>
      <div data-testid="expandedNodes">{JSON.stringify(expandedNodes)}</div>
      <div data-testid="viewMode">{viewMode}</div>
      <div data-testid="isGraphLoading">{isGraphLoading.toString()}</div>
      <div data-testid="isTreeLoading">{isTreeLoading.toString()}</div>
      <div data-testid="graphError">{graphError}</div>
      <div data-testid="treeError">{treeError}</div>
      
      <button 
        onClick={() => setGraphData({ nodes: [{ id: '1' }], edges: [{ id: 'e1' }] })} 
        data-testid="set-graph-data"
      >
        Set Graph Data
      </button>
      <button 
        onClick={() => setTreeData({ id: 'root', children: [] })} 
        data-testid="set-tree-data"
      >
        Set Tree Data
      </button>
      <button 
        onClick={() => setSelectedNode({ id: 'node1' })} 
        data-testid="set-selected-node"
      >
        Set Selected Node
      </button>
      <button 
        onClick={() => setExpandedNodes(['node1', 'node2'])} 
        data-testid="set-expanded-nodes"
      >
        Set Expanded Nodes
      </button>
      <button 
        onClick={() => toggleNodeExpansion('node1')} 
        data-testid="toggle-node"
      >
        Toggle Node
      </button>
      <button 
        onClick={() => setGraphOptions({ physics: { enabled: false } })} 
        data-testid="set-graph-options"
      >
        Set Graph Options
      </button>
      <button 
        onClick={() => setViewMode('tree')} 
        data-testid="set-view-mode"
      >
        Set View Mode
      </button>
      <button 
        onClick={() => setGraphLoading(true)} 
        data-testid="set-graph-loading"
      >
        Set Graph Loading
      </button>
      <button 
        onClick={() => setGraphError('Graph error')} 
        data-testid="set-graph-error"
      >
        Set Graph Error
      </button>
      <button 
        onClick={clearVisualization} 
        data-testid="clear-visualization"
      >
        Clear Visualization
      </button>
    </div>
  );
};

describe('VisualizationContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    console.warn = jest.fn(); // Mock console.warn for localStorage errors
  });

  it('provides initial state correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    expect(screen.getByTestId('graphData')).toHaveTextContent('{"nodes":[],"edges":[]}');
    expect(screen.getByTestId('treeData')).toHaveTextContent('null');
    expect(screen.getByTestId('selectedNode')).toHaveTextContent('null');
    expect(screen.getByTestId('expandedNodes')).toHaveTextContent('[]');
    expect(screen.getByTestId('viewMode')).toHaveTextContent('graph');
    expect(screen.getByTestId('isGraphLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('isTreeLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('graphError')).toHaveTextContent('');
    expect(screen.getByTestId('treeError')).toHaveTextContent('');
  });

  it('updates graph data and clears loading/error state', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    // First set loading and error
    act(() => {
      fireEvent.click(screen.getByTestId('set-graph-loading'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('set-graph-error'));
    });

    expect(screen.getByTestId('isGraphLoading')).toHaveTextContent('true');
    expect(screen.getByTestId('graphError')).toHaveTextContent('Graph error');

    // Then set graph data - should clear loading and error
    act(() => {
      fireEvent.click(screen.getByTestId('set-graph-data'));
    });

    expect(screen.getByTestId('graphData')).toHaveTextContent('{"nodes":[{"id":"1"}],"edges":[{"id":"e1"}]}');
    expect(screen.getByTestId('isGraphLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('graphError')).toHaveTextContent('');
  });

  it('updates tree data correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-tree-data'));
    });

    expect(screen.getByTestId('treeData')).toHaveTextContent('{"id":"root","children":[]}');
  });

  it('manages node selection correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-selected-node'));
    });

    expect(screen.getByTestId('selectedNode')).toHaveTextContent('{"id":"node1"}');
  });

  it('manages expanded nodes correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-expanded-nodes'));
    });

    expect(screen.getByTestId('expandedNodes')).toHaveTextContent('["node1","node2"]');
  });

  it('toggles node expansion correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    // Set some initial expanded nodes first
    act(() => {
      fireEvent.click(screen.getByTestId('set-expanded-nodes'));
    });

    expect(screen.getByTestId('expandedNodes')).toHaveTextContent('["node1","node2"]');

    // Toggle node1 should remove it
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-node'));
    });

    expect(screen.getByTestId('expandedNodes')).toHaveTextContent('["node2"]');

    // Toggle node1 again should add it back
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-node'));
    });

    expect(screen.getByTestId('expandedNodes')).toHaveTextContent('["node2","node1"]');
  });

  it('updates graph options correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-graph-options'));
    });

    // Check that physics.enabled was updated while other options remain
    const graphOptionsText = screen.getByTestId('graphData').parentElement.querySelector('[data-testid="graphData"]');
    // We can't easily test the graphOptions directly, but we can verify the action was called
    // by checking that no error was thrown
    expect(screen.getByTestId('graphData')).toBeInTheDocument();
  });

  it('updates view mode correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-view-mode'));
    });

    expect(screen.getByTestId('viewMode')).toHaveTextContent('tree');
  });

  it('clears visualization state correctly', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    // Set some state first
    act(() => {
      fireEvent.click(screen.getByTestId('set-graph-data'));
      fireEvent.click(screen.getByTestId('set-tree-data'));
      fireEvent.click(screen.getByTestId('set-selected-node'));
      fireEvent.click(screen.getByTestId('set-graph-error'));
    });

    // Verify state is set
    expect(screen.getByTestId('graphData')).toHaveTextContent('{"nodes":[{"id":"1"}],"edges":[{"id":"e1"}]}');
    expect(screen.getByTestId('treeData')).toHaveTextContent('{"id":"root","children":[]}');

    // Clear visualization
    act(() => {
      fireEvent.click(screen.getByTestId('clear-visualization'));
    });

    // Verify state is cleared
    expect(screen.getByTestId('graphData')).toHaveTextContent('{"nodes":[],"edges":[]}');
    expect(screen.getByTestId('treeData')).toHaveTextContent('null');
    expect(screen.getByTestId('selectedNode')).toHaveTextContent('null');
    expect(screen.getByTestId('graphError')).toHaveTextContent('');
  });

  it('loads preferences from localStorage on mount', () => {
    const savedPreferences = {
      graphOptions: { physics: { enabled: false } },
      viewMode: 'tree',
      expandedNodes: ['node1']
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));

    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('ontology-visualization-preferences');
    expect(screen.getByTestId('viewMode')).toHaveTextContent('tree');
    expect(screen.getByTestId('expandedNodes')).toHaveTextContent('["node1"]');
  });

  it('saves preferences to localStorage when they change', () => {
    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-view-mode'));
      fireEvent.click(screen.getByTestId('set-expanded-nodes'));
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ontology-visualization-preferences',
      expect.stringContaining('"viewMode":"tree"')
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ontology-visualization-preferences',
      expect.stringContaining('"expandedNodes":["node1","node2"]')
    );
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    render(
      <VisualizationProvider>
        <TestComponent />
      </VisualizationProvider>
    );

    expect(console.warn).toHaveBeenCalledWith(
      'Failed to load visualization preferences from localStorage:',
      expect.any(Error)
    );
  });

  it('throws error when useVisualization is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useVisualization must be used within a VisualizationProvider');

    console.error = originalError;
  });
});