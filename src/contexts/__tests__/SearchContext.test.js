import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { SearchProvider, useSearch, SEARCH_ACTIONS } from '../SearchContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test component that uses the search context
const TestComponent = () => {
  const {
    query,
    filters,
    results,
    selectedEntity,
    isLoading,
    error,
    recentSearches,
    setQuery,
    setFilters,
    setResults,
    setSelectedEntity,
    setLoading,
    setError,
    addRecentSearch,
    clearSearch
  } = useSearch();

  return (
    <div>
      <div data-testid="query">{query}</div>
      <div data-testid="filters">{JSON.stringify(filters)}</div>
      <div data-testid="results">{JSON.stringify(results)}</div>
      <div data-testid="selectedEntity">{JSON.stringify(selectedEntity)}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <div data-testid="error">{error}</div>
      <div data-testid="recentSearches">{JSON.stringify(recentSearches)}</div>
      
      <button onClick={() => setQuery('test query')} data-testid="set-query">
        Set Query
      </button>
      <button onClick={() => setFilters(['Person', 'Station'])} data-testid="set-filters">
        Set Filters
      </button>
      <button onClick={() => setResults([{ id: '1', label: 'Test Entity' }])} data-testid="set-results">
        Set Results
      </button>
      <button onClick={() => setSelectedEntity({ id: '1', label: 'Selected' })} data-testid="set-selected">
        Set Selected
      </button>
      <button onClick={() => setLoading(true)} data-testid="set-loading">
        Set Loading
      </button>
      <button onClick={() => setError('Test error')} data-testid="set-error">
        Set Error
      </button>
      <button onClick={() => addRecentSearch('recent search')} data-testid="add-recent">
        Add Recent
      </button>
      <button onClick={clearSearch} data-testid="clear-search">
        Clear Search
      </button>
    </div>
  );
};

describe('SearchContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    console.warn = jest.fn(); // Mock console.warn for localStorage errors
  });

  it('provides initial state correctly', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    expect(screen.getByTestId('query')).toHaveTextContent('');
    expect(screen.getByTestId('filters')).toHaveTextContent('[]');
    expect(screen.getByTestId('results')).toHaveTextContent('[]');
    expect(screen.getByTestId('selectedEntity')).toHaveTextContent('null');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('');
    expect(screen.getByTestId('recentSearches')).toHaveTextContent('[]');
  });

  it('updates query state correctly', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-query'));
    });

    expect(screen.getByTestId('query')).toHaveTextContent('test query');
  });

  it('updates filters state correctly', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-filters'));
    });

    expect(screen.getByTestId('filters')).toHaveTextContent('["Person","Station"]');
  });

  it('updates results and clears loading/error state', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    // First set loading and error
    act(() => {
      fireEvent.click(screen.getByTestId('set-loading'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('set-error'));
    });

    expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('Test error');

    // Then set results - should clear loading and error
    act(() => {
      fireEvent.click(screen.getByTestId('set-results'));
    });

    expect(screen.getByTestId('results')).toHaveTextContent('[{"id":"1","label":"Test Entity"}]');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('manages recent searches correctly', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-recent'));
    });

    expect(screen.getByTestId('recentSearches')).toHaveTextContent('["recent search"]');
  });

  it('clears search state correctly', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    // Set some state first
    act(() => {
      fireEvent.click(screen.getByTestId('set-query'));
      fireEvent.click(screen.getByTestId('set-results'));
      fireEvent.click(screen.getByTestId('set-selected'));
      fireEvent.click(screen.getByTestId('set-error'));
    });

    // Verify state is set
    expect(screen.getByTestId('query')).toHaveTextContent('test query');
    expect(screen.getByTestId('results')).toHaveTextContent('[{"id":"1","label":"Test Entity"}]');

    // Clear search
    act(() => {
      fireEvent.click(screen.getByTestId('clear-search'));
    });

    // Verify state is cleared
    expect(screen.getByTestId('query')).toHaveTextContent('');
    expect(screen.getByTestId('results')).toHaveTextContent('[]');
    expect(screen.getByTestId('selectedEntity')).toHaveTextContent('null');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('loads state from localStorage on mount', () => {
    const savedState = {
      recentSearches: ['search1', 'search2'],
      filters: ['Person']
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('ontology-search-state');
    expect(screen.getByTestId('recentSearches')).toHaveTextContent('["search1","search2"]');
    expect(screen.getByTestId('filters')).toHaveTextContent('["Person"]');
  });

  it('saves state to localStorage when it changes', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-filters'));
      fireEvent.click(screen.getByTestId('add-recent'));
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ontology-search-state',
      expect.stringContaining('"filters":["Person","Station"]')
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ontology-search-state',
      expect.stringContaining('"recentSearches":["recent search"]')
    );
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    expect(console.warn).toHaveBeenCalledWith(
      'Failed to load search state from localStorage:',
      expect.any(Error)
    );
  });

  it('throws error when useSearch is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSearch must be used within a SearchProvider');

    console.error = originalError;
  });
});