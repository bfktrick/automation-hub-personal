import { useState, useCallback } from 'react';
import { Automation } from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export function useAutomations(token: string | null) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomations = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/automations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch automations');

      const data = await response.json();
      setAutomations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching automations');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createAutomation = useCallback(
    async (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt' | 'lastRunStatus'>) => {
      if (!token) return null;

      try {
        const response = await fetch(`${API_URL}/api/v1/automations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(automation),
        });

        if (!response.ok) throw new Error('Failed to create automation');

        const data = await response.json();
        setAutomations((prev) => [...prev, data]);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error creating automation');
        return null;
      }
    },
    [token],
  );

  const toggleAutomation = useCallback(
    async (id: string) => {
      if (!token) return null;

      try {
        const response = await fetch(`${API_URL}/api/v1/automations/${id}/toggle`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to toggle automation');

        const data = await response.json();
        setAutomations((prev) => prev.map((a) => (a.id === id ? data : a)));
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error toggling automation');
        return null;
      }
    },
    [token],
  );

  const executeNow = useCallback(
    async (id: string) => {
      if (!token) return null;

      try {
        const response = await fetch(`${API_URL}/api/v1/automations/${id}/execute`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to execute automation');

        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error executing automation');
        return null;
      }
    },
    [token],
  );

  const deleteAutomation = useCallback(
    async (id: string) => {
      if (!token) return false;

      try {
        const response = await fetch(`${API_URL}/api/v1/automations/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to delete automation');

        setAutomations((prev) => prev.filter((a) => a.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error deleting automation');
        return false;
      }
    },
    [token],
  );

  return {
    automations,
    isLoading,
    error,
    fetchAutomations,
    createAutomation,
    toggleAutomation,
    executeNow,
    deleteAutomation,
  };
}
