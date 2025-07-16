import { useState, useEffect } from 'react';
import { convertTaskRecordToTask, Task } from './type';
import { TaskFilter } from './task-filter';
import { getTasks, update } from './api';

export const useTasks = (filter: TaskFilter, start_date: Date | undefined = undefined, end_date: Date | undefined = undefined) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async (filter: TaskFilter, start_date: Date | undefined = undefined, end_date: Date | undefined = undefined) => {
    if (loading) return; // Prevent multiple concurrent loads
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await getTasks(filter, start_date, end_date);
      console.log("Fetched tasks:", fetchedTasks.length);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // const createTask = async (taskData: Partial<Task>) => {
  //   try {
  //     const newTask = await taskAPI.createTask(taskData);
  //     setTasks(prev => [...prev, newTask]);
  //     return newTask;
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to create task');
  //     throw err;
  //   }
  // };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      update(id, taskData).then((updatedTask) => {
        const task = convertTaskRecordToTask(updatedTask);
        setTasks(prev => prev.map(task => task.id === id ? task : task));
        return task;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  // const deleteTask = async (id: string) => {
  //   try {
  //     await taskAPI.deleteTask(id);
  //     setTasks(prev => prev.filter(task => task.id !== id));
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to delete task');
  //     throw err;
  //   }
  // };

  // const addTagToTask = async (taskId: string, tagId: string) => {
  //   try {
  //     const updatedTask = await taskAPI.addTagToTask(taskId, tagId);
  //     setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
  //     return updatedTask;
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to add tag to task');
  //     throw err;
  //   }
  // };

  // const removeTagFromTask = async (taskId: string, tagId: string) => {
  //   try {
  //     const updatedTask = await taskAPI.removeTagFromTask(taskId, tagId);
  //     setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
  //     return updatedTask;
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to remove tag from task');
  //     throw err;
  //   }
  // };

  useEffect(() => {
    loadTasks(filter, start_date, end_date);
  }, []);

  return {
    tasks,
    loading,
    error,
    // createTask,
    updateTask,
    // deleteTask,
    // addTagToTask,
    // removeTagFromTask,
    refetch: loadTasks,
  };
};

