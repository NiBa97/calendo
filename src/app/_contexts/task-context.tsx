// contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Task } from "@prisma/client";

import { api } from "~/trpc/react";
interface TaskContextType {
  tasks: Task[];
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updatedData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: fetched_tasks } = api.task.getAll.useQuery();

  const { mutateAsync: updateMutation } = api.task.update.useMutation();
  const { mutateAsync: createMutation } = api.task.create.useMutation();
  const { mutate: deleteMutation } = api.task.delete.useMutation();

  useEffect(() => {
    if (fetched_tasks) {
      setTasks(fetched_tasks);
    }
  }, [fetched_tasks]);

  const createTask = async (taskData: Partial<Task>) => {
    const dataWithDefaults = taskData as {
      name: string;
      startDate?: Date | undefined;
      endDate?: Date | undefined;
      isAllDay?: boolean | undefined;
      status?: boolean | undefined;
      description?: string | undefined;
      groupId?: string | undefined;
    };
    const newTask = await createMutation(dataWithDefaults);
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    const dataWithDefaults = updatedData as {
      name: string;
      startDate?: Date | undefined | null;
      endDate?: Date | undefined | null;
      isAllDay?: boolean | undefined;
      status?: boolean | undefined;
      description?: string | undefined;
      groupId?: string | undefined | null;
    };
    const updatedTask = await updateMutation({ id: taskId, ...dataWithDefaults });
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)));
  };

  const deleteTask = async (taskId: string) => {
    deleteMutation({ id: taskId });
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return <TaskContext.Provider value={{ tasks, createTask, updateTask, deleteTask }}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
