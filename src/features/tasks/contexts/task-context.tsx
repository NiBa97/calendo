// contexts/TaskContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useToast } from "@chakra-ui/toast";
import { Task } from "../types/task.types";
import { taskAPI } from "../api/task-api";
import { useTaskLoader } from "../hooks/useTaskLoader";
import { useOperationStatus } from "../../../contexts/operation-status-context";
import { useTaskUI } from "../hooks/useTaskUI";

interface TaskContextType {
  tasks: Task[];
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updatedData: Partial<Task>) => Promise<void>;
  restoreTask: (taskId: string, historyTimestamp: Date, restoreTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  loadTasksForRange: (date: Date) => Promise<void>;
  addTagToTask: (taskId: string, tagId: string) => Promise<void>;
  removeTagFromTask: (taskId: string, tagId: string) => Promise<void>;
  // UI State - delegated to useTaskUI hook
  draggingTask: Task | null;
  setDraggingTask: (task: Task | null) => void;
  modalTask: Task | null;
  setModalTask: (task: Task | null) => void;
  temporaryTask: Task | null;
  setTemporaryTask: (task: Task | null) => void;
  contextInformation: { x: number; y: number; task: Task } | undefined;
  setContextInformation: (info: { x: number; y: number; task: Task } | undefined) => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const taskUI = useTaskUI();
  const toast = useToast();
  const taskLoader = useTaskLoader();
  const { setStatus } = useOperationStatus();

  const loadTasksForRange = async (date: Date) => {
    const updatedTasks = await taskLoader.loadTasksForRange(date, tasks);
    if (updatedTasks) {
      setTasks(updatedTasks);
    }
  };

  useEffect(() => {
    setStatus("loading");
    taskAPI.loadTasks()
      .then(async (value) => {
        taskLoader.resetLoadedMonths();
        try {
          setTasks(value);
          await loadTasksForRange(new Date());
          setStatus("idle");
        } catch (error) {
          console.error("Error loading tasks:", error);
          setStatus("error");
        }
      })
      .catch((error) => {
        console.error("Failed to load tasks:", error);
        setStatus("error");
      });
  }, [loadTasksForRange, setStatus, taskLoader]);

  const createTask = async (taskData: Partial<Task>) => {
    try {
      setStatus("loading");
      const newTask = await taskAPI.createTask(taskData);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setStatus("idle");
      return newTask;
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      setStatus("loading");
      const updatedTask = await taskAPI.updateTask(taskId, taskData);

      toast({
        title: "Task updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const restoreTask = async (taskId: string, historyTimestamp: Date, taskData: Partial<Task>) => {
    // TODO: Implement task restoration functionality
    console.debug('restoreTask called with:', { taskId, historyTimestamp, taskData });
    try {
      setStatus("loading");
      alert("Not yet implemented!");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setStatus("loading");
      await taskAPI.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const addTagToTask = async (taskId: string, tagId: string) => {
    try {
      setStatus("loading");
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const updatedTags = [...(task.tags || [])];
      if (!updatedTags.includes(tagId)) {
        updatedTags.push(tagId);
      }

      // Optimistically update the UI first
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, tags: updatedTags } : t)));

      // Then update in the backend
      await taskAPI.addTagToTask(taskId, tagId);
      setStatus("idle");
    } catch (error) {
      // Revert the optimistic update on error
      setStatus("error");
      throw error;
    }
  };

  const removeTagFromTask = async (taskId: string, tagId: string) => {
    try {
      setStatus("loading");
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const updatedTags = (task.tags || []).filter((id) => id !== tagId);

      // Optimistically update the UI first
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, tags: updatedTags } : t)));

      // Then update in the backend
      await taskAPI.removeTagFromTask(taskId, tagId);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const contextValue: TaskContextType = {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
    loadTasksForRange,
    addTagToTask,
    removeTagFromTask,
    // UI State delegation
    ...taskUI,
  };

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
