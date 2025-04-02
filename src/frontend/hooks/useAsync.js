import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for handling asynchronous operations with loading, error, and data states
 * @param {Function} asyncFunction - The async function to execute
 * @param {boolean} immediate - Whether to execute the function immediately
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} Object containing data, loading, error states and execute function
 */
export function useAsync(asyncFunction, immediate = true, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return { data, loading, error, execute };
}
