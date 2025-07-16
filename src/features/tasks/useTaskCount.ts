import { useState, useEffect } from 'react';
import { TaskFilter } from './task-filter';
import { getTaskCount } from './api';

export const useTaskCount = (filter: TaskFilter) => {
  const [taskCount, setTaskCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTaskCount = async (filter: TaskFilter) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCount = await getTaskCount(filter);
      console.log("Fetched task count:", fetchedCount);
      setTaskCount(fetchedCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskCount(filter);
  }, []);

  return {
    taskCount,
    loading,
    error,
    // createTask,
    // updateTask,
    // deleteTask,
    // addTagToTask,
    // removeTagFromTask,
    refetch: loadTaskCount,
  };
};

