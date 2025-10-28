import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input with placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox', { name: /search ontology concepts/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search ontology concepts...');
  });

  test('calls onSearch with debounced input after 300ms', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test query');
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Should call after debounce delay
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    }, { timeout: 500 });
  });

  test('validates minimum 2 characters', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Type single character
    await userEvent.type(input, 'a');
    
    // Should show validation message
    await waitFor(() => {
      expect(screen.getByText(/please enter at least 2 characters/i)).toBeInTheDocument();
    });
    
    // Input should have invalid class
    expect(input).toHaveClass('invalid');
  });

  test('clears validation error when input is valid', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Type single character to trigger validation error
    await userEvent.type(input, 'a');
    await waitFor(() => {
      expect(screen.getByText(/please enter at least 2 characters/i)).toBeInTheDocument();
    });
    
    // Type second character
    await userEvent.type(input, 'b');
    
    // Validation message should disappear
    await waitFor(() => {
      expect(screen.queryByText(/please enter at least 2 characters/i)).not.toBeInTheDocument();
    });
    
    // Input should not have invalid class
    expect(input).not.toHaveClass('invalid');
  });

  test('shows clear button when input has value', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Initially no clear button
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    
    // Type something
    await userEvent.type(input, 'test');
    
    // Clear button should appear
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  test('clears input when clear button is clicked', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Type something
    await userEvent.type(input, 'test query');
    expect(input).toHaveValue('test query');
    
    // Click clear button
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await userEvent.click(clearButton);
    
    // Input should be cleared
    expect(input).toHaveValue('');
    
    // Should call onSearch with empty string
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  test('handles form submission', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Type valid query
    await userEvent.type(input, 'test query');
    
    // Submit form
    fireEvent.submit(input.closest('form'));
    
    // Should call onSearch immediately on submit
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  test('disables input when disabled prop is true', () => {
    render(<SearchBar onSearch={mockOnSearch} disabled={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  test('uses custom placeholder when provided', () => {
    const customPlaceholder = 'Custom search placeholder';
    render(<SearchBar onSearch={mockOnSearch} placeholder={customPlaceholder} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });
});