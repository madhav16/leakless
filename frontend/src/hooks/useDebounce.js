import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until after a delay.
 * Useful for search inputs to avoid excessive API calls.
 *
 * @param {unknown} value  The value to debounce
 * @param {number}  delay  Delay in milliseconds (default 300)
 * @returns Debounced value
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 400);
 * useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
