// Combined error boundary wrapper for convenience
import React from 'react';
import SearchErrorBoundary from './SearchErrorBoundary';
import VisualizationErrorBoundary from './VisualizationErrorBoundary';

// Export all error boundaries from a single entry point
export { default as SearchErrorBoundary } from './SearchErrorBoundary';
export { default as VisualizationErrorBoundary } from './VisualizationErrorBoundary';

export const OntologyErrorBoundaries = ({ children, fallbackData }) => {
  return (
    <SearchErrorBoundary>
      <VisualizationErrorBoundary fallbackData={fallbackData}>
        {children}
      </VisualizationErrorBoundary>
    </SearchErrorBoundary>
  );
};