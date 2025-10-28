import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HierarchyTree from '../HierarchyTree';

describe('HierarchyTree', () => {
  const mockOnNodeSelect = jest.fn();
  
  const sampleEntities = [
    {
      id: 'Person',
      label: 'Person',
      type: 'Person',
      subType: 'Class',
      properties: { subClassOf: 'owl:Thing' },
      relationships: []
    },
    {
      id: 'Citizen',
      label: 'Citizen',
      type: 'Person',
      subType: 'Class',
      properties: { subClassOf: 'Person' },
      relationships: []
    },
    {
      id: 'Station',
      label: 'Station',
      type: 'Station',
      subType: 'Class',
      properties: { subClassOf: 'owl:Thing' },
      relationships: []
    },
    {
      id: 'MetroStation',
      label: 'Metro Station',
      type: 'Station',
      subType: 'Class',
      properties: { subClassOf: 'Station' },
      relationships: []
    }
  ];

  const sampleRelationships = [
    {
      id: 'rel1',
      source: 'Citizen',
      target: 'Person',
      type: 'subClassOf',
      label: 'is subclass of'
    },
    {
      id: 'rel2',
      source: 'Person',
      target: 'owl:Thing',
      type: 'subClassOf',
      label: 'is subclass of'
    },
    {
      id: 'rel3',
      source: 'MetroStation',
      target: 'Station',
      type: 'subClassOf',
      label: 'is subclass of'
    },
    {
      id: 'rel4',
      source: 'Station',
      target: 'owl:Thing',
      type: 'subClassOf',
      label: 'is subclass of'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state when no entities are provided', () => {
    render(<HierarchyTree entities={[]} relationships={[]} onNodeSelect={mockOnNodeSelect} />);
    
    expect(screen.getByText('Class Hierarchy')).toBeInTheDocument();
    expect(screen.getByText('No class hierarchy available in the current ontology.')).toBeInTheDocument();
  });

  test('renders tree header with title and controls', () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Ontology Class Hierarchy')).toBeInTheDocument();
    expect(screen.getByTitle('Expand All')).toBeInTheDocument();
    expect(screen.getByTitle('Collapse All')).toBeInTheDocument();
  });

  test('renders root Thing node', () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Thing')).toBeInTheDocument();
  });

  test('renders class nodes with correct labels', () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
  });

  test('shows expand buttons for nodes with children', () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    // Thing node should have expand button (has children)
    const thingNode = screen.getByText('Thing').closest('.tree-node');
    expect(thingNode.querySelector('.expand-button')).toBeInTheDocument();
  });

  test('expands node when expand button is clicked', async () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    // Initially, child nodes should be visible (Thing is expanded by default)
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
    
    // Find Person node and its expand button
    const personNode = screen.getByText('Person').closest('.tree-node');
    const expandButton = personNode.querySelector('.expand-button');
    
    // Click to expand Person node
    await userEvent.click(expandButton);
    
    // Citizen should now be visible
    expect(screen.getByText('Citizen')).toBeInTheDocument();
  });

  test('collapses node when expand button is clicked on expanded node', async () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    // Find Thing node expand button and collapse it
    const thingNode = screen.getByText('Thing').closest('.tree-node');
    const expandButton = thingNode.querySelector('.expand-button');
    
    await userEvent.click(expandButton);
    
    // Person and Station should no longer be visible
    expect(screen.queryByText('Person')).not.toBeInTheDocument();
    expect(screen.queryByText('Station')).not.toBeInTheDocument();
  });

  test('calls onNodeSelect when node is clicked', async () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const personNode = screen.getByText('Person').closest('.tree-node');
    await userEvent.click(personNode);
    
    expect(mockOnNodeSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'Person',
        label: 'Person',
        type: 'Person'
      })
    );
  });

  test('highlights selected node', () => {
    const selectedEntity = sampleEntities[0]; // Person entity
    
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
        selectedEntity={selectedEntity}
      />
    );
    
    const personNode = screen.getByText('Person').closest('.tree-node');
    expect(personNode).toHaveClass('selected');
  });

  test('shows inheritance path for selected entity', () => {
    const selectedEntity = sampleEntities[1]; // Citizen entity
    
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
        selectedEntity={selectedEntity}
      />
    );
    
    expect(screen.getByText('Inheritance Path:')).toBeInTheDocument();
    expect(screen.getByText('Thing')).toBeInTheDocument();
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Citizen')).toBeInTheDocument();
  });

  test('expand all button expands all nodes', async () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const expandAllButton = screen.getByTitle('Expand All');
    await userEvent.click(expandAllButton);
    
    // All nodes should be visible
    expect(screen.getByText('Thing')).toBeInTheDocument();
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Citizen')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
    expect(screen.getByText('Metro Station')).toBeInTheDocument();
  });

  test('collapse all button collapses all nodes except root', async () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    // First expand all
    const expandAllButton = screen.getByTitle('Expand All');
    await userEvent.click(expandAllButton);
    
    // Then collapse all
    const collapseAllButton = screen.getByTitle('Collapse All');
    await userEvent.click(collapseAllButton);
    
    // Only Thing should be visible, others should be hidden
    expect(screen.getByText('Thing')).toBeInTheDocument();
    expect(screen.queryByText('Person')).not.toBeInTheDocument();
    expect(screen.queryByText('Station')).not.toBeInTheDocument();
  });

  test('displays node count in instructions', () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    // Should show expanded count (Thing is expanded by default, showing Person and Station)
    expect(screen.getByText(/2 of 4 classes expanded/)).toBeInTheDocument();
  });

  test('renders entity type indicators for class nodes', () => {
    render(
      <HierarchyTree
        entities={sampleEntities}
        relationships={sampleRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    // Check that type indicators are present
    const typeIndicators = document.querySelectorAll('.node-type-indicator');
    expect(typeIndicators.length).toBeGreaterThan(0);
  });

  test('handles entities without subclass relationships', () => {
    const entitiesWithoutSubclass = [
      {
        id: 'OrphanClass',
        label: 'Orphan Class',
        type: 'Unknown',
        subType: 'Class',
        properties: {},
        relationships: []
      }
    ];
    
    render(
      <HierarchyTree
        entities={entitiesWithoutSubclass}
        relationships={[]}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    // Orphan class should be added under Thing
    expect(screen.getByText('Thing')).toBeInTheDocument();
    expect(screen.getByText('Orphan Class')).toBeInTheDocument();
  });

  test('sorts children alphabetically', () => {
    const unsortedEntities = [
      {
        id: 'ZClass',
        label: 'Z Class',
        type: 'Unknown',
        subType: 'Class',
        properties: { subClassOf: 'owl:Thing' },
        relationships: []
      },
      {
        id: 'AClass',
        label: 'A Class',
        type: 'Unknown',
        subType: 'Class',
        properties: { subClassOf: 'owl:Thing' },
        relationships: []
      }
    ];
    
    const unsortedRelationships = [
      {
        id: 'rel1',
        source: 'ZClass',
        target: 'owl:Thing',
        type: 'subClassOf',
        label: 'is subclass of'
      },
      {
        id: 'rel2',
        source: 'AClass',
        target: 'owl:Thing',
        type: 'subClassOf',
        label: 'is subclass of'
      }
    ];
    
    render(
      <HierarchyTree
        entities={unsortedEntities}
        relationships={unsortedRelationships}
        onNodeSelect={mockOnNodeSelect}
      />
    );
    
    const nodeLabels = screen.getAllByText(/Class/).map(el => el.textContent);
    const classLabels = nodeLabels.filter(label => label !== 'Thing');
    
    // Should be sorted: A Class, Z Class
    expect(classLabels[0]).toBe('A Class');
    expect(classLabels[1]).toBe('Z Class');
  });
});