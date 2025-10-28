import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntityCard from '../EntityCard';

describe('EntityCard', () => {
  const mockOnSelect = jest.fn();
  
  const sampleEntity = {
    id: '1',
    label: 'Metro Station A',
    type: 'Station',
    subType: 'MetroStation',
    properties: {
      hasCapacity: 1000,
      hasLocation: 'Downtown',
      hasOperatingHours: '5:00-24:00',
      label: 'Metro Station A', // Should be filtered out
      type: 'Station' // Should be filtered out
    },
    relationships: [
      { id: 'rel1', source: '1', target: '2', type: 'connectsTo', label: 'connects to' },
      { id: 'rel2', source: '1', target: '3', type: 'serves', label: 'serves' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders entity label and type', () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('Metro Station A')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
  });

  test('renders entity subtype when present', () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('(MetroStation)')).toBeInTheDocument();
  });

  test('does not render subtype when not present', () => {
    const entityWithoutSubtype = { ...sampleEntity, subType: undefined };
    
    render(<EntityCard entity={entityWithoutSubtype} onSelect={mockOnSelect} />);
    
    expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
  });

  test('renders limited properties excluding label and type', () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    // Should show first 3 properties (excluding label and type)
    expect(screen.getByText('hasCapacity:')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('hasLocation:')).toBeInTheDocument();
    expect(screen.getByText('Downtown')).toBeInTheDocument();
    expect(screen.getByText('hasOperatingHours:')).toBeInTheDocument();
    
    // Should not show label and type properties
    expect(screen.queryByText('label:')).not.toBeInTheDocument();
    expect(screen.queryByText('type:')).not.toBeInTheDocument();
  });

  test('renders relationships count', () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('2 relationships')).toBeInTheDocument();
  });

  test('renders singular relationship text for single relationship', () => {
    const entityWithOneRelationship = {
      ...sampleEntity,
      relationships: [sampleEntity.relationships[0]]
    };
    
    render(<EntityCard entity={entityWithOneRelationship} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('1 relationship')).toBeInTheDocument();
  });

  test('does not render relationships section when no relationships', () => {
    const entityWithoutRelationships = {
      ...sampleEntity,
      relationships: []
    };
    
    render(<EntityCard entity={entityWithoutRelationships} onSelect={mockOnSelect} />);
    
    expect(screen.queryByText(/relationship/)).not.toBeInTheDocument();
  });

  test('calls onSelect when clicked', async () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    await userEvent.click(card);
    
    expect(mockOnSelect).toHaveBeenCalledWith(sampleEntity);
  });

  test('calls onSelect when Enter key is pressed', async () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    card.focus();
    await userEvent.keyboard('{Enter}');
    
    expect(mockOnSelect).toHaveBeenCalledWith(sampleEntity);
  });

  test('calls onSelect when Space key is pressed', async () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    card.focus();
    fireEvent.keyPress(card, { key: ' ', code: 'Space', charCode: 32 });
    
    expect(mockOnSelect).toHaveBeenCalledWith(sampleEntity);
  });

  test('applies selected class when isSelected is true', () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} isSelected={true} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('selected');
  });

  test('does not apply selected class when isSelected is false', () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} isSelected={false} />);
    
    const card = screen.getByRole('button');
    expect(card).not.toHaveClass('selected');
  });

  test('handles entity with no properties', () => {
    const entityWithoutProperties = {
      ...sampleEntity,
      properties: {}
    };
    
    render(<EntityCard entity={entityWithoutProperties} onSelect={mockOnSelect} />);
    
    // Should still render label and type
    expect(screen.getByText('Metro Station A')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
    
    // Should not render properties section
    expect(screen.queryByText(':')).not.toBeInTheDocument();
  });

  test('handles entity with null properties', () => {
    const entityWithNullProperties = {
      ...sampleEntity,
      properties: null
    };
    
    render(<EntityCard entity={entityWithNullProperties} onSelect={mockOnSelect} />);
    
    // Should render without crashing
    expect(screen.getByText('Metro Station A')).toBeInTheDocument();
  });

  test('has correct accessibility attributes', () => {
    render(<EntityCard entity={sampleEntity} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Select Metro Station A (Station)');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  test('uses correct entity type color for different types', () => {
    const personEntity = { ...sampleEntity, type: 'Person' };
    
    render(<EntityCard entity={personEntity} onSelect={mockOnSelect} />);
    
    // The color is applied via inline styles, so we check for the presence of the indicator
    const indicator = document.querySelector('.entity-type-indicator');
    expect(indicator).toBeInTheDocument();
  });
});