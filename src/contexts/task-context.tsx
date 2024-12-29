// contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Attachment, type Task } from "@prisma/client";
import { api } from "~/trpc/react";
import { useToast } from "@chakra-ui/react";
import { useTaskLoader } from "~/hooks/useTaskLoader";
interface TaskContextType {
  tasks: Task[];
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updatedData: Partial<Task>) => Promise<void>;
  restoreTask: (taskId: string, historyTimestamp: Date, restoreTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  draggingTask: Task | null;
  setDraggingTask: (task: Task | null) => void;
  contextInformation: { x: number; y: number; task: Task } | undefined;
  setContextInformation: (contextInformation: { x: number; y: number; task: Task } | undefined) => void;
  temporaryTask: Task | null;
  setTemporaryTask: (task: Task | null) => void;
  modalTask: Task | null;
  setModalTask: (task: Task | null) => void;
  loadTasksForRange: (date: Date) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [temporaryTask, setTemporaryTask] = useState<Task | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [contextInformation, setContextInformation] = useState<{ x: number; y: number; task: Task } | undefined>(
    undefined
  );
  const { data: fetched_tasks } = api.task.getDefaultAll.useQuery();

  const { mutateAsync: updateMutation } = api.task.update.useMutation();
  const { mutateAsync: createMutation } = api.task.create.useMutation();
  const { mutateAsync: deleteMutation } = api.task.delete.useMutation();
  const { mutateAsync: restoreMutation } = api.task.restore.useMutation();
  const toast = useToast();
  const taskLoader = useTaskLoader();

  // Load tasks for a given date
  const loadTasksForRange = async (date: Date) => {
    const updatedTasks = await taskLoader.loadTasksForRange(date, tasks);
    if (updatedTasks) {
      setTasks(updatedTasks);
    }
  };

  useEffect(() => {
    if (fetched_tasks) {
      setTasks(fetched_tasks);
      void loadTasksForRange(new Date());
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
    return newTask;
  };

  const updateTask = async (taskId: string, restoreTask: Partial<Task>) => {
    const dataWithDefaults = restoreTask as {
      name: string;
      startDate?: Date | undefined | null;
      endDate?: Date | undefined | null;
      isAllDay?: boolean | undefined;
      status?: boolean | undefined;
      description?: string | undefined;
      groupId?: string | undefined | null;
    };
    await updateMutation({ id: taskId, ...dataWithDefaults })
      .then((updatedTask: Task) => {
        toast({
          title: "Task updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)));
      })
      .catch((error: Error) => {
        toast({
          title: "Error",
          description: error.message || "An error occurred while updating the task.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return null;
      });
  };

  const restoreTask = async (taskId: string, historyTimestamp: Date, taskData: Partial<Task>) => {
    const dataWithDefaults = taskData as {
      name: string;
      startDate?: Date | undefined | null;
      endDate?: Date | undefined | null;
      isAllDay?: boolean | undefined;
      status?: boolean | undefined;
      description?: string | undefined;
      groupId?: string | undefined | null;
    };
    await restoreMutation({ originalID: taskId, historyTimestamp: historyTimestamp, ...dataWithDefaults })
      .then((updatedTask: Task) => {
        toast({
          title: "Task restored",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)));
      })
      .catch((error: Error) => {
        toast({
          title: "Error",
          description: error.message || "An error occurred while restoring the task.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return null;
      });
  };

  const deleteTask = async (taskId: string) => {
    await deleteMutation({ id: taskId });
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        deleteTask,
        draggingTask,
        setDraggingTask,
        contextInformation,
        setContextInformation,
        temporaryTask,
        setTemporaryTask,
        modalTask,
        setModalTask,
        restoreTask,
        loadTasksForRange,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
