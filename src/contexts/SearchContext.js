import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialSearchState = {
  query: '',
  filters: [],
  results: [],
  selectedEntity: null,
  isLoading: false,
  error: null,
  recentSearches: []
};

// Action types
export const SEARCH_ACTIONS = {
  SET_QUERY: 'SET_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_RESULTS: 'SET_RESULTS',
  SET_SELECTED_ENTITY: 'SET_SELECTED_ENTITY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_RECENT_SEARCH: 'ADD_RECENT_SEARCH',
  CLEAR_SEARCH: 'CLEAR_SEARCH'
};

// Reducer function
const searchReducer = (state, action) => {
  switch (action.type) {
    case SEARCH_ACTIONS.SET_QUERY:
      return { ...state, query: action.payload };
    
    case SEARCH_ACTIONS.SET_FILTERS:
      return { ...state, filters: action.payload };
    
    case SEARCH_ACTIONS.SET_RESULTS:
      return { ...state, results: action.payload, isLoading: false, error: null };
    
    case SEARCH_ACTIONS.SET_SELECTED_ENTITY:
      return { ...state, selectedEntity: action.payload };
    
    case SEARCH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case SEARCH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case SEARCH_ACTIONS.ADD_RECENT_SEARCH:
      if (!action.payload) return state;
      const newRecentSearches = [
        action.payload,
        ...state.recentSearches.filter(search => search !== action.payload)
      ].slice(0, 10); // Keep only last 10 searches
      return { ...state, recentSearches: newRecentSearches };
    
    case SEARCH_ACTIONS.CLEAR_SEARCH:
      return {
        ...state,
        query: '',
        results: [],
        selectedEntity: null,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const SearchContext = createContext();

// Custom hook to use search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

// Provider component
export const SearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('ontology-search-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.recentSearches && Array.isArray(parsedState.recentSearches)) {
          parsedState.recentSearches.forEach(search => {
            dispatch({
              type: SEARCH_ACTIONS.ADD_RECENT_SEARCH,
              payload: search
            });
          });
        }
        if (parsedState.filters) {
          dispatch({
            type: SEARCH_ACTIONS.SET_FILTERS,
            payload: parsedState.filters
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load search state from localStorage:', error);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      const stateToSave = {
        recentSearches: state.recentSearches,
        filters: state.filters
      };
      localStorage.setItem('ontology-search-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save search state to localStorage:', error);
    }
  }, [state.recentSearches, state.filters]);

  // Action creators
  const actions = {
    setQuery: (query) => dispatch({ type: SEARCH_ACTIONS.SET_QUERY, payload: query }),
    setFilters: (filters) => dispatch({ type: SEARCH_ACTIONS.SET_FILTERS, payload: filters }),
    setResults: (results) => dispatch({ type: SEARCH_ACTIONS.SET_RESULTS, payload: results }),
    setSelectedEntity: (entity) => dispatch({ type: SEARCH_ACTIONS.SET_SELECTED_ENTITY, payload: entity }),
    setLoading: (loading) => dispatch({ type: SEARCH_ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: SEARCH_ACTIONS.SET_ERROR, payload: error }),
    addRecentSearch: (query) => dispatch({ type: SEARCH_ACTIONS.ADD_RECENT_SEARCH, payload: query }),
    clearSearch: () => dispatch({ type: SEARCH_ACTIONS.CLEAR_SEARCH })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;