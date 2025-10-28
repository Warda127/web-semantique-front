import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPanel from '../FilterPanel';

describe('FilterPanel', () => {
  const mockOnFilterChange = jest.fn();
  const defaultFilterCounts = {
    Person: 5,
    Station: 10,
    TransportMode: 3,
    Trip: 8,
    Route: 6,
    Schedule: 4
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all entity type filters', () => {
    render(
      <FilterPanel 
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Station')).toBeInTheDocument();
    expect(screen.getByText('Transport Mode')).toBeInTheDocument();
    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  test('displays filter counts correctly', () => {
    render(
      <FilterPanel 
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    expect(screen.getByText('(5)')).toBeInTheDocument(); // Person count
    expect(screen.getByText('(10)')).toBeInTheDocument(); // Station count
    expect(screen.getByText('(3)')).toBeInTheDocument(); // TransportMode count
  });

  test('shows selected filters as checked', () => {
    const selectedFilters = ['Person', 'Station'];
    
    render(
      <FilterPanel 
        selectedFilters={selectedFilters}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    const personCheckbox = screen.getByRole('checkbox', { name: /person/i });
    const stationCheckbox = screen.getByRole('checkbox', { name: /station/i });
    const tripCheckbox = screen.getByRole('checkbox', { name: /trip/i });
    
    expect(personCheckbox).toBeChecked();
    expect(stationCheckbox).toBeChecked();
    expect(tripCheckbox).not.toBeChecked();
  });

  test('calls onFilterChange when filter is toggled', async () => {
    const selectedFilters = ['Person'];
    
    render(
      <FilterPanel 
        selectedFilters={selectedFilters}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    // Click Station checkbox to add it
    const stationCheckbox = screen.getByRole('checkbox', { name: /station/i });
    await userEvent.click(stationCheckbox);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(['Person', 'Station']);
  });

  test('removes filter when unchecking selected filter', async () => {
    const selectedFilters = ['Person', 'Station'];
    
    render(
      <FilterPanel 
        selectedFilters={selectedFilters}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    // Click Person checkbox to remove it
    const personCheckbox = screen.getByRole('checkbox', { name: /person/i });
    await userEvent.click(personCheckbox);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(['Station']);
  });

  test('shows clear all button when filters are active', () => {
    const selectedFilters = ['Person', 'Station'];
    
    render(
      <FilterPanel 
        selectedFilters={selectedFilters}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  test('hides clear all button when no filters are active', () => {
    render(
      <FilterPanel 
        selectedFilters={[]}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
  });

  test('clears all filters when clear all button is clicked', async () => {
    const selectedFilters = ['Person', 'Station', 'Trip'];
    
    render(
      <FilterPanel 
        selectedFilters={selectedFilters}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
    await userEvent.click(clearAllButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
  });

  test('shows active filters summary', () => {
    const selectedFilters = ['Person', 'Station'];
    
    render(
      <FilterPanel 
        selectedFilters={selectedFilters}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    expect(screen.getByText('2 filters active')).toBeInTheDocument();
  });

  test('shows singular filter text for single active filter', () => {
    const selectedFilters = ['Person'];
    
    render(
      <FilterPanel 
        selectedFilters={selectedFilters}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    expect(screen.getByText('1 filter active')).toBeInTheDocument();
  });

  test('disables unavailable filters', () => {
    const availableFilters = ['Person', 'Station'];
    
    render(
      <FilterPanel 
        availableFilters={availableFilters}
        selectedFilters={[]}
        onFilterChange={mockOnFilterChange}
        filterCounts={defaultFilterCounts}
      />
    );
    
    const personCheckbox = screen.getByRole('checkbox', { name: /person/i });
    const tripCheckbox = screen.getByRole('checkbox', { name: /trip/i });
    
    expect(personCheckbox).not.toBeDisabled();
    expect(tripCheckbox).toBeDisabled();
  });

  test('shows zero counts for missing filter counts', () => {
    const partialFilterCounts = {
      Person: 5,
      Station: 10
    };
    
    render(
      <FilterPanel 
        onFilterChange={mockOnFilterChange}
        filterCounts={partialFilterCounts}
      />
    );
    
    expect(screen.getByText('(5)')).toBeInTheDocument(); // Person count
    expect(screen.getAllByText('(0)').length).toBeGreaterThan(0); // Missing counts show as 0
  });
});