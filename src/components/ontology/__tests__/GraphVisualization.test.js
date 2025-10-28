import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GraphVisualization from '../GraphVisualization';

// Mock vis-network
const mockNetworkInstance = {
  on: jest.fn(),
  once: jest.fn((event, callback) => {
    if (event === 'stabilizationIterationsDone') {
      // Simulate stabilization completion
      setTimeout(callback, 0);
    }
  }),
  destroy: jest.fn(),
  fit: jest.fn(),
  moveTo: jest.fn(),
  getScale: jest.fn(() => 1),
  getViewPosition: jest.fn(() => ({ x: 0, y: 0 })),
  getConnectedNodes: jest.fn(() => []),
  getConnectedEdges: jest.fn(() => []),
  selectNodes: jest.fn(),
  selectEdges: jest.fn(),
  unselectAll: jest.fn(),
  updateCluster: jest.fn(),
  setOptions: jest.fn(),
  stabilize: jest.fn()
};

jest.mock('vis-network', () => ({
  Network: jest.fn().mockImplementation(() => mockNetworkInstance)
}));

describe('GraphVisualization', () => {
  const mockOnNodeSelect = jest.fn();
  
  const sampleEntity = {
    id: 'station1',
    label: 'Metro Station A',
    type: 'Station',
    subType: 'MetroStation',
    properties: { hasCapacity: 1000 },
    relationships: []
  };

  const sampleRelatedEntities = [
    {
      id: 'person1',
      label: 'John Doe',
      type: 'Person',
      subType: 'Citizen',
      properties: {},
      relationships: []
    },
    {
      id: 'transport1',
      label: 'Metro Line 1',
      type: 'TransportMode',
      subType: 'Metro',
      properties: {},
      relationships: []
    }
  ];

  const sampleRelationships = [
    {
      id: 'rel1',
      source: 'station1',
      target: 'person1',
      type: 'serves',
      label: 'serves'
    },
    {
      id: 'rel2',
      source: 'station1',
      target: 'transport1',
      type: 'connectsTo',
      label: 'connects to'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock network instance
    Object.keys(mockNetworkInstance).forEach(key => {
      if (typeof mockNetworkInstance[key] === 'function') {
        mockNetworkInstance[key].mockClear();
      }
    });
    // Reset the once method to default behavior
    mockNetworkInstance.once.mockImplementation((event, callback) => {
      if (event === 'stabilizationIterationsDone') {
        setTimeout(callback, 0);
      }
    });
  });

  test('renders empty state when no entity is selected', () => {
    render(<GraphVisualization onNodeSelect={mockOnNodeSelect} />);
    
    expect(screen.getByText('Graph Visualization')).toBeInTheDocument();
    expect(screen.getByText('Select an entity from search results to visualize its relationships.')).toBeInTheDocument();
  });

  test('renders graph header with selected entity information', () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Relationship Graph: Metro Station A')).toBeInTheDocument();
    expect(screen.getByText('3 nodes')).toBeInTheDocument();
    expect(screen.getByText('2 relationships')).toBeInTheDocument();
  });

  test('renders entity type legend', () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Entity Types')).toBeInTheDocument();
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
    expect(screen.getByText('TransportMode')).toBeInTheDocument();
  });

  test('renders control buttons', () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
    expect(screen.getByTitle('Fit to Screen')).toBeInTheDocument();
    expect(screen.getByTitle('Center View')).toBeInTheDocument();
    expect(screen.getByTitle('Disable Physics')).toBeInTheDocument();
    expect(screen.getByTitle('Stabilize Layout')).toBeInTheDocument();
  });

  test('shows loading state initially', async () => {
    // Mock the once method to not call the callback immediately
    mockNetworkInstance.once.mockImplementation(() => {});
    
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Building graph...')).toBeInTheDocument();
  });

  test('limits nodes to maxNodes parameter', () => {
    const manyRelatedEntities = Array.from({ length: 25 }, (_, i) => ({
      id: `entity${i}`,
      label: `Entity ${i}`,
      type: 'Person',
      properties: {},
      relationships: []
    }));

    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={manyRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
        maxNodes={10}
      />
    );
    
    expect(screen.getByText('10 nodes')).toBeInTheDocument();
  });

  test('zoom in button calls network moveTo with increased scale', async () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const zoomInButton = screen.getByTitle('Zoom In');
    await userEvent.click(zoomInButton);
    
    expect(mockNetworkInstance.moveTo).toHaveBeenCalledWith({
      scale: 1.2,
      animation: { duration: 300, easingFunction: 'easeInOutQuad' }
    });
  });

  test('zoom out button calls network moveTo with decreased scale', async () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const zoomOutButton = screen.getByTitle('Zoom Out');
    await userEvent.click(zoomOutButton);
    
    expect(mockNetworkInstance.moveTo).toHaveBeenCalledWith({
      scale: 0.8,
      animation: { duration: 300, easingFunction: 'easeInOutQuad' }
    });
  });

  test('fit to screen button calls network fit', async () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const fitButton = screen.getByTitle('Fit to Screen');
    await userEvent.click(fitButton);
    
    expect(mockNetworkInstance.fit).toHaveBeenCalledWith({
      animation: { duration: 500, easingFunction: 'easeInOutQuad' }
    });
  });

  test('physics toggle button changes physics state', async () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const physicsButton = screen.getByTitle('Disable Physics');
    await userEvent.click(physicsButton);
    
    expect(mockNetworkInstance.setOptions).toHaveBeenCalledWith({
      physics: { enabled: false }
    });
    
    // Button text should change
    expect(screen.getByTitle('Enable Physics')).toBeInTheDocument();
  });

  test('stabilize button calls network stabilize', async () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const stabilizeButton = screen.getByTitle('Stabilize Layout');
    await userEvent.click(stabilizeButton);
    
    expect(mockNetworkInstance.stabilize).toHaveBeenCalled();
  });

  test('displays zoom percentage in status', () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
  });

  test('renders instructions text', () => {
    render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Click nodes to select • Drag to pan • Scroll to zoom • Hover for highlights')).toBeInTheDocument();
  });

  test('handles entity change by updating graph', () => {
    const { rerender } = render(
      <GraphVisualization
        selectedEntity={sampleEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const newEntity = {
      id: 'person2',
      label: 'Jane Doe',
      type: 'Person',
      properties: {},
      relationships: []
    };
    
    rerender(
      <GraphVisualization
        selectedEntity={newEntity}
        relatedEntities={sampleRelatedEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Relationship Graph: Jane Doe')).toBeInTheDocument();
  });
});