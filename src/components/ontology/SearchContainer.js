import React, { useState } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import SearchResults from './SearchResults';
import { useSearch } from '../../contexts';
import './SearchContainer.css';

const SearchContainer = ({ onEntitySelect, selectedEntity }) => {
  const {
    query,
    filters,
    results,
    isLoading,
    error,
    setQuery,
    setFilters,
    setResults,
    setLoading,
    setError,
    addRecentSearch
  } = useSearch();

  const [hasSearched, setHasSearched] = useState(false);
  const [filterCounts, setFilterCounts] = useState({});

  // Mock data for development - replace with actual RDF data processing
  const mockEntities = [
    {
      id: 'person_1',
      label: 'Citizen',
      type: 'Person',
      subType: 'Citizen',
      properties: { hasAge: 25, hasName: 'John Doe' },
      relationships: []
    },
    {
      id: 'person_2',
      label: 'Tourist',
      type: 'Person',
      subType: 'Tourist',
      properties: { hasAge: 30, hasName: 'Jane Smith' },
      relationships: []
    },
    {
      id: 'station_1',
      label: 'Metro Station A',
      type: 'Station',
      subType: 'MetroStation',
      properties: { hasCapacity: 1000, hasLocation: 'Downtown' },
      relationships: []
    },
    {
      id: 'station_2',
      label: 'Central Bike Station',
      type: 'Station',
      subType: 'BikeStation',
      properties: { hasCapacity: 50, hasLocation: 'City Center' },
      relationships: []
    },
    {
      id: 'station_3',
      label: 'Main Bus Terminal',
      type: 'Station',
      subType: 'BusStation',
      properties: { hasCapacity: 200, hasLocation: 'Transport Hub' },
      relationships: []
    },
    {
      id: 'transport_1',
      label: 'Metro Line 1',
      type: 'TransportMode',
      subType: 'Metro',
      properties: { hasSpeed: 60, hasCapacity: 300 },
      relationships: []
    },
    {
      id: 'transport_2',
      label: 'Electric Bike',
      type: 'TransportMode',
      subType: 'Bike',
      properties: { hasSpeed: 25, hasCapacity: 1 },
      relationships: []
    },
    {
      id: 'transport_3',
      label: 'City Bus',
      type: 'TransportMode',
      subType: 'Bus',
      properties: { hasSpeed: 40, hasCapacity: 50 },
      relationships: []
    },
    {
      id: 'trip_1',
      label: 'Morning Commute',
      type: 'Trip',
      subType: 'Trip',
      properties: { hasDuration: 45, hasDistance: 15 },
      relationships: []
    },
    {
      id: 'route_1',
      label: 'City Center Route',
      type: 'Route',
      subType: 'Route',
      properties: { hasLength: 12.5, hasStops: 8 },
      relationships: []
    }
  ];

  // Fetch additional data from working endpoints
  const fetchAdditionalData = async (searchQuery) => {
    const additionalResults = [];

    try {
      // Fetch transport modes
      const transportResponse = await fetch('http://localhost:5000/api/transport-modes/', {
        headers: { 'Accept': 'application/json' }
      });
      if (transportResponse.ok) {
        const transportData = await transportResponse.json();
        const modes = transportData.modes || [];
        modes.forEach(mode => {
          if (mode.name && mode.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            additionalResults.push({
              id: mode.localname || mode.id,
              label: mode.name,
              type: 'TransportMode',
              subType: mode.class ? mode.class.split('#').pop() : 'TransportMode',
              properties: {
                speed: mode.speed,
                class: mode.class
              },
              relationships: []
            });
          }
        });
      }

      // Fetch travel plans
      const plansResponse = await fetch('http://localhost:5000/api/travel-plans/', {
        headers: { 'Accept': 'application/json' }
      });
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        const plans = plansData.plans || [];
        plans.forEach(plan => {
          if (plan.name && plan.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            additionalResults.push({
              id: plan.localname || plan.id,
              label: plan.name,
              type: 'Trip',
              subType: 'TravelPlan',
              properties: {
                description: plan.description,
                userType: plan.userType
              },
              relationships: []
            });
          }
        });
      }
    } catch (error) {
      console.warn('Error fetching additional data:', error);
    }

    return additionalResults;
  };

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    setHasSearched(true);

    if (!searchQuery.trim()) {
      setResults([]);
      setFilterCounts({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the real backend API
      const response = await fetch(`http://localhost:5000/api/search/concepts?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let searchResults = data.concepts || [];

      // Fetch additional data from working endpoints
      const additionalResults = await fetchAdditionalData(searchQuery);
      searchResults = [...searchResults, ...additionalResults];

      // If still no results from API, fall back to mock data for demo purposes
      if (searchResults.length === 0) {
        console.log('No results from API, using mock data for demo');
        const filtered = mockEntities.filter(entity =>
          entity.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (entity.subType && entity.subType.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        searchResults = filtered;
      }

      // Apply type filters
      const filteredByType = filters.length > 0
        ? searchResults.filter(entity => filters.includes(entity.type))
        : searchResults;

      setResults(filteredByType);

      // Calculate filter counts
      const counts = {};
      ['Person', 'Station', 'TransportMode', 'Trip', 'Route', 'Schedule'].forEach(type => {
        counts[type] = searchResults.filter(entity => entity.type === type).length;
      });
      setFilterCounts(counts);

      // Add to recent searches
      addRecentSearch(searchQuery);

    } catch (error) {
      console.error('Search error:', error);
      setError(error.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    // Re-apply search with new filters
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleEntitySelect = (entity) => {
    if (onEntitySelect) {
      onEntitySelect(entity);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h2 className="search-title">Ontology Search</h2>
        <p className="search-description">
          Search and explore concepts from the WebSemEsprit urban transport ontology
        </p>
      </div>

      <div className="search-controls">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for persons, stations, transport modes..."
          disabled={isLoading}
        />

        <FilterPanel
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          filterCounts={filterCounts}
        />
      </div>

      <div className="search-content">
        <SearchResults
          results={results}
          onEntitySelect={handleEntitySelect}
          selectedEntity={selectedEntity}
          isLoading={isLoading}
          searchQuery={query}
          hasSearched={hasSearched}
          error={error}
        />
      </div>
    </div>
  );
};

export default SearchContainer;