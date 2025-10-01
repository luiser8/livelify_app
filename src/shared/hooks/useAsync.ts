import { useState, useCallback } from 'react';
import type { LoadingState } from '../types';

/**
 * Hook personalizado para manejar operaciones asíncronas
 */
export const useAsync = <T, P extends unknown[]>(
  asyncFunction: (...args: P) => Promise<T>
) => {
  const [status, setStatus] = useState<LoadingState>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setStatus('loading');
      setData(null);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response);
        setStatus('success');
        return response;
      } catch (error) {
        setError(error as Error);
        setStatus('error');
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
    reset,
  };
};

