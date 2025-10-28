import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchResults from '../SearchResults';

describe('SearchResults', () => {
  const mockOnEntitySelect = jest.fn();
  
  const sampleEntities = [
    {
      id: '1',
      label: 'Metro Station A',
      type: 'Station',
      subType: 'MetroStation',
      properties: {
        hasCapacity: 1000,
        hasLocation: 'Downtown'
      },
      relationships: [
        { id: 'rel1', source: '1', target: '2', type: 'connectsTo', label: 'connects to' }
      ]
    },
    {
      id: '2',
      label: 'John Doe',
      type: 'Person',
      properties: {
        hasAge: 30,
        hasRole: 'Commuter'
      },
      relationships: []
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows initial empty state when no search has been performed', () => {
    render(
      <SearchResults 
        results={[]}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={false}
      />
    );
    
    expect(screen.getByText('Search Ontology Concepts')).toBeInTheDocument();
    expect(screen.getByText(/enter a search term to explore entities/i)).toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(
      <SearchResults 
        results={[]}
        onEntitySelect={mockOnEntitySelect}
        isLoading={true}
        hasSearched={true}
      />
    );
    
    expect(screen.getByText('Searching ontology...')).toBeInTheDocument();
  });

  test('shows no results message when search returns empty results', () => {
    render(
      <SearchResults 
        results={[]}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
        searchQuery="nonexistent"
      />
    );
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element && element.textContent === 'No entities found for "nonexistent".';
    })).toBeInTheDocument();
  });

  test('displays search suggestions in no results state', () => {
    render(
      <SearchResults 
        results={[]}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
        searchQuery="test"
      />
    );
    
    expect(screen.getByText('Using different keywords')).toBeInTheDocument();
    expect(screen.getByText('Checking your spelling')).toBeInTheDocument();
    expect(screen.getByText('Using broader search terms')).toBeInTheDocument();
    expect(screen.getByText('Adjusting your filters')).toBeInTheDocument();
  });

  test('renders search results with correct count', () => {
    render(
      <SearchResults 
        results={sampleEntities}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
      />
    );
    
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('2 results found')).toBeInTheDocument();
  });

  test('renders singular result count correctly', () => {
    render(
      <SearchResults 
        results={[sampleEntities[0]]}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
      />
    );
    
    expect(screen.getByText('1 result found')).toBeInTheDocument();
  });

  test('renders entity cards for each result', () => {
    render(
      <SearchResults 
        results={sampleEntities}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
      />
    );
    
    expect(screen.getByText('Metro Station A')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
    expect(screen.getByText('Person')).toBeInTheDocument();
  });

  test('calls onEntitySelect when entity card is clicked', async () => {
    render(
      <SearchResults 
        results={sampleEntities}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
      />
    );
    
    const entityCard = screen.getByRole('button', { name: /select metro station a/i });
    await userEvent.click(entityCard);
    
    expect(mockOnEntitySelect).toHaveBeenCalledWith(sampleEntities[0]);
  });

  test('highlights selected entity', () => {
    render(
      <SearchResults 
        results={sampleEntities}
        onEntitySelect={mockOnEntitySelect}
        selectedEntity={sampleEntities[0]}
        hasSearched={true}
      />
    );
    
    const selectedCard = screen.getByRole('button', { name: /select metro station a/i });
    expect(selectedCard).toHaveClass('selected');
  });

  test('shows results footer for large result sets', () => {
    const manyResults = Array.from({ length: 15 }, (_, i) => ({
      ...sampleEntities[0],
      id: `entity-${i}`,
      label: `Entity ${i}`
    }));
    
    render(
      <SearchResults 
        results={manyResults}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
      />
    );
    
    expect(screen.getByText(/showing 15 results/i)).toBeInTheDocument();
    expect(screen.getByText(/select an entity to visualize/i)).toBeInTheDocument();
  });

  test('does not show results footer for small result sets', () => {
    render(
      <SearchResults 
        results={sampleEntities}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
      />
    );
    
    expect(screen.queryByText(/showing.*results/i)).not.toBeInTheDocument();
  });

  test('handles empty results array gracefully', () => {
    render(
      <SearchResults 
        results={[]}
        onEntitySelect={mockOnEntitySelect}
        hasSearched={true}
        searchQuery=""
      />
    );
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  test('handles missing props gracefully', () => {
    render(<SearchResults onEntitySelect={mockOnEntitySelect} />);
    
    // Should render empty state without crashing
    expect(screen.getByText('Search Ontology Concepts')).toBeInTheDocument();
  });
});