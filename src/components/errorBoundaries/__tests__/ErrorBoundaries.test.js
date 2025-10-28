import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchErrorBoundary from '../SearchErrorBoundary';
import VisualizationErrorBoundary from '../VisualizationErrorBoundary';
import { OntologyErrorBoundaries } from '../index';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock gtag for analytics
global.gtag = jest.fn();

// Component that throws an error
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="no-error">No error occurred</div>;
};

describe('SearchErrorBoundary', () => {
  beforeEach(() => {
    console.error.mockClear();
    global.gtag.mockClear();
  });

  it('renders children when there is no error', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError />
      </SearchErrorBoundary>
    );

    expect(screen.getByTestId('no-error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SearchErrorBoundary>
    );

    expect(screen.getByText('Search Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong with the search functionality. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('shows fallback search interface when error occurs', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SearchErrorBoundary>
    );

    expect(screen.getByText('Basic Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter search term...')).toBeInTheDocument();
    expect(screen.getByText('This is a basic search fallback. Please refresh the page to restore full search functionality.')).toBeInTheDocument();
  });

  it('handles retry button click', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SearchErrorBoundary>
    );

    expect(screen.getByText('Search Error')).toBeInTheDocument();

    // Click retry button - this should reset the error boundary state
    fireEvent.click(screen.getByText('Try Again'));

    // The error boundary should still show the error UI since the component will throw again
    // In a real scenario, the retry would work if the underlying issue was resolved
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('logs error to analytics when gtag is available', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Analytics test error" />
      </SearchErrorBoundary>
    );

    expect(global.gtag).toHaveBeenCalledWith('event', 'exception', {
      description: 'Search Error: Analytics test error',
      fatal: false
    });
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <SearchErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Development error" />
      </SearchErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('handles basic search input in fallback mode', () => {
    // Mock alert
    global.alert = jest.fn();

    render(
      <SearchErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SearchErrorBoundary>
    );

    const searchInput = screen.getByPlaceholderText('Enter search term...');
    
    // Test with valid query
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(global.alert).toHaveBeenCalledWith('Search for "test query" - Please refresh the page to restore full functionality.');

    global.alert.mockRestore();
  });
});

describe('VisualizationErrorBoundary', () => {
  beforeEach(() => {
    console.error.mockClear();
    global.gtag.mockClear();
  });

  it('renders children when there is no error', () => {
    render(
      <VisualizationErrorBoundary>
        <ThrowError />
      </VisualizationErrorBoundary>
    );

    expect(screen.getByTestId('no-error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <VisualizationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </VisualizationErrorBoundary>
    );

    expect(screen.getByText('Visualization Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to render the graph or tree visualization. Showing alternative view.')).toBeInTheDocument();
  });

  it('shows fallback list view with entity data', () => {
    const fallbackData = {
      entities: [
        { id: '1', type: 'Person', label: 'John Doe', properties: { age: 30, city: 'New York' } },
        { id: '2', type: 'Station', label: 'Central Station', properties: { capacity: 1000 } }
      ],
      relationships: [
        { source: 'John Doe', type: 'visits', target: 'Central Station' }
      ]
    };

    render(
      <VisualizationErrorBoundary fallbackData={fallbackData}>
        <ThrowError shouldThrow={true} />
      </VisualizationErrorBoundary>
    );

    expect(screen.getByText('Entity List View')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Central Station')).toBeInTheDocument();
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('John Doe → visits → Central Station')).toBeInTheDocument();
  });

  it('shows no data message when fallback data is empty', () => {
    const fallbackData = { entities: [], relationships: [] };

    render(
      <VisualizationErrorBoundary fallbackData={fallbackData}>
        <ThrowError shouldThrow={true} />
      </VisualizationErrorBoundary>
    );

    expect(screen.getByText('No visualization data available')).toBeInTheDocument();
  });

  it('shows fallback note when no fallback data provided', () => {
    render(
      <VisualizationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </VisualizationErrorBoundary>
    );

    expect(screen.getByText('Visualization data is not available. Please try refreshing the page or contact support if the problem persists.')).toBeInTheDocument();
  });

  it('logs error to analytics when gtag is available', () => {
    render(
      <VisualizationErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Visualization analytics error" />
      </VisualizationErrorBoundary>
    );

    expect(global.gtag).toHaveBeenCalledWith('event', 'exception', {
      description: 'Visualization Error: Visualization analytics error',
      fatal: false
    });
  });
});

describe('OntologyErrorBoundaries', () => {
  it('wraps children with both error boundaries', () => {
    render(
      <OntologyErrorBoundaries>
        <ThrowError />
      </OntologyErrorBoundaries>
    );

    expect(screen.getByTestId('no-error')).toBeInTheDocument();
  });

  it('handles search errors with combined boundaries', () => {
    render(
      <OntologyErrorBoundaries>
        <ThrowError shouldThrow={true} />
      </OntologyErrorBoundaries>
    );

    // Should show visualization error boundary (inner boundary catches first)
    expect(screen.getByText('Visualization Error')).toBeInTheDocument();
  });
});