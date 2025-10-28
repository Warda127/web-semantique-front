// Combined provider component for convenience
import React from 'react';
import { SearchProvider } from './SearchContext';
import { VisualizationProvider } from './VisualizationContext';

// Export all contexts from a single entry point
export { SearchProvider, useSearch, SEARCH_ACTIONS } from './SearchContext';
export { VisualizationProvider, useVisualization, VISUALIZATION_ACTIONS } from './VisualizationContext';

export const OntologyProviders = ({ children }) => {
  return (
    <SearchProvider>
      <VisualizationProvider>
        {children}
      </VisualizationProvider>
    </SearchProvider>
  );
};