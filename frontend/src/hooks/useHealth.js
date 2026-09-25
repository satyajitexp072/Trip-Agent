import { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService.js';

export function useHealth(pollInterval = 30000) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthService.checkHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    if (pollInterval > 0) {
      const interval = setInterval(fetchHealth, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchHealth, pollInterval]);

  return { health, loading, error, refetch: fetchHealth };
}
