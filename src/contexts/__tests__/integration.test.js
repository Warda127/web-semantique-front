import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { OntologyProviders } from '../index';
import { useSearch, useVisualization } from '../index';

// Simple test component that uses both contexts
const IntegrationTestComponent = () => {
  const { query, setQuery, results, setResults } = useSearch();
  const { viewMode, setViewMode, graphData, setGraphData } = useVisualization();

  return (
    <div>
      <div data-testid="search-query">{query}</div>
      <div data-testid="search-results">{JSON.stringify(results)}</div>
      <div data-testid="view-mode">{viewMode}</div>
      <div data-testid="graph-data">{JSON.stringify(graphData)}</div>
      
      <button onClick={() => setQuery('test')} data-testid="set-query">
        Set Query
      </button>
      <button onClick={() => setResults([{ id: '1', label: 'Test' }])} data-testid="set-results">
        Set Results
      </button>
      <button onClick={() => setViewMode('tree')} data-testid="set-view-mode">
        Set View Mode
      </button>
      <button onClick={() => setGraphData({ nodes: [{ id: '1' }], edges: [] })} data-testid="set-graph-data">
        Set Graph Data
      </button>
    </div>
  );
};

describe('Context Integration', () => {
  it('provides both search and visualization contexts', () => {
    render(
      <OntologyProviders>
        <IntegrationTestComponent />
      </OntologyProviders>
    );

    // Check initial states
    expect(screen.getByTestId('search-query')).toHaveTextContent('');
    expect(screen.getByTestId('search-results')).toHaveTextContent('[]');
    expect(screen.getByTestId('view-mode')).toHaveTextContent('graph');
    expect(screen.getByTestId('graph-data')).toHaveTextContent('{"nodes":[],"edges":[]}');
  });

  it('allows updating search state', () => {
    render(
      <OntologyProviders>
        <IntegrationTestComponent />
      </OntologyProviders>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-query'));
    });

    expect(screen.getByTestId('search-query')).toHaveTextContent('test');

    act(() => {
      fireEvent.click(screen.getByTestId('set-results'));
    });

    expect(screen.getByTestId('search-results')).toHaveTextContent('[{"id":"1","label":"Test"}]');
  });

  it('allows updating visualization state', () => {
    render(
      <OntologyProviders>
        <IntegrationTestComponent />
      </OntologyProviders>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-view-mode'));
    });

    expect(screen.getByTestId('view-mode')).toHaveTextContent('tree');

    act(() => {
      fireEvent.click(screen.getByTestId('set-graph-data'));
    });

    expect(screen.getByTestId('graph-data')).toHaveTextContent('{"nodes":[{"id":"1"}],"edges":[]}');
  });
});