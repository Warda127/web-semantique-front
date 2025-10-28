import React, { useState, useEffect, useCallback } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search ontology concepts...", disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.length >= 2) {
        onSearch(term);
      } else if (term.length === 0) {
        onSearch('');
      }
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Validation: minimum 2 characters or empty
    setIsValid(value.length === 0 || value.length >= 2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.length >= 2) {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsValid(true);
    onSearch('');
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`search-input ${!isValid ? 'invalid' : ''}`}
            aria-label="Search ontology concepts"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {!isValid && (
          <div className="validation-message" role="alert">
            Please enter at least 2 characters to search
          </div>
        )}
      </form>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchBar;