// contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useToast } from "@chakra-ui/toast";
import { convertTaskRecordToTask, Task } from "../types";
import { getPb } from "../pocketbaseUtils";
import { TaskRecord } from "../pocketbase-types";
import { useTaskLoader } from "../hooks/useTaskLoader";

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
  const pb = getPb();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [temporaryTask, setTemporaryTask] = useState<Task | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [contextInformation, setContextInformation] = useState<{ x: number; y: number; task: Task } | undefined>(
    undefined
  );
  const toast = useToast();
  const taskLoader = useTaskLoader();

  // Load tasks for a given date
  const loadTasksForRange = async (date: Date) => {
    console.log("Tasks before", tasks);
    const updatedTasks = await taskLoader.loadTasksForRange(date, tasks);
    console.log("Tasks after", updatedTasks);
    if (updatedTasks) {
      console.log("Updatin!", updateTasks);
      setTasks(updatedTasks);
    }
  };
  console.log("context created", tasks);
  useEffect(() => {
    console.log("Context init");
    pb.collection("task")
      .getFullList()
      .then(async (value: TaskRecord[]) => {
        console.log("tasks...", value);
        taskLoader.resetLoadedMonths();
        setTasks(value.map((record) => convertTaskRecordToTask(record)));

        await loadTasksForRange(new Date());
      });
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    const currentTime = new Date();
    const isInPast =
      taskData.startDate && taskData.endDate && taskData.startDate < currentTime && taskData.endDate < currentTime;

    const data = {
      startDate: taskData.startDate?.toISOString(),
      endDate: taskData.endDate?.toISOString(),
      isAllDay: taskData.isAllDay ?? false,
      status: isInPast ? true : taskData.status ?? false,
      name: taskData.name,
      description: taskData.description,
      user: pb.authStore.record?.id, // Get the current user's ID from PocketBase
    };

    const record = await pb.collection("tasks").create(data);
    const newTask = convertTaskRecordToTask(record);
    setTasks((prevTasks) => [...prevTasks, newTask]);
    return newTask;
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const data = {
        startDate: taskData.startDate?.toISOString(),
        endDate: taskData.endDate?.toISOString(),
        isAllDay: taskData.isAllDay,
        status: taskData.status,
        name: taskData.name,
        description: taskData.description,
        user: pb.authStore.model?.id,
      };

      const record = await pb.collection("tasks").update(taskId, data);
      const updatedTask = convertTaskRecordToTask(record);

      toast({
        title: "Task updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)));
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "An error occurred while updating the task.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  const restoreTask = async (taskId: string, historyTimestamp: Date, taskData: Partial<Task>) => {
    alert("Not yet implemented!");
  };

  const deleteTask = async (taskId: string) => {
    await await pb.collection("task").delete(taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const contextValue: TaskContextType = {
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
