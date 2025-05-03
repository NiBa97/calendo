// contexts/TaskContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useToast } from "@chakra-ui/toast";
import { convertTaskRecordToTask, Task } from "../types";
import { getPb } from "../pocketbaseUtils";
import { useTaskLoader } from "../hooks/useTaskLoader";
import { useOperationStatus } from "./operation-status-context";

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
  addTagToTask: (taskId: string, tagId: string) => Promise<void>;
  removeTagFromTask: (taskId: string, tagId: string) => Promise<void>;
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
  const { setStatus } = useOperationStatus();

  const loadTasksForRange = async (date: Date) => {
    const updatedTasks = await taskLoader.loadTasksForRange(date, tasks);
    if (updatedTasks) {
      setTasks(updatedTasks);
    }
  };

  useEffect(() => {
    setStatus("loading");
    pb.collection("task")
      .getFullList()
      .then(async (value) => {
        taskLoader.resetLoadedMonths();
        try {
          setTasks(value.map(convertTaskRecordToTask));
          await loadTasksForRange(new Date());
          setStatus("idle");
        } catch (error) {
          console.error("Error converting task records:", error);
          setStatus("error");
        }
      })
      .catch((error) => {
        console.error("Failed to load tasks:", error);
        setStatus("error");
      });
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    try {
      setStatus("loading");
      const currentTime = new Date();
      const isInPast =
        taskData.startDate && taskData.endDate && taskData.startDate < currentTime && taskData.endDate < currentTime;

      console.log("taskData", taskData);
      const data = {
        startDate: taskData.startDate?.toISOString(),
        endDate: taskData.endDate?.toISOString(),
        isAllDay: taskData.isAllDay ?? false,
        status: isInPast ? true : taskData.status ?? false,
        title: taskData.title,
        description: taskData.description,
        tags: taskData.tags || [],
        user: [pb.authStore.record?.id],
      };

      const record = await pb.collection("task").create(data);
      console.log("record", record);

      const newTask = convertTaskRecordToTask(record);
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

      // If startDate is being updated and is after endDate, adjust endDate accordingly
      if (taskData.startDate && taskData.endDate && taskData.startDate > taskData.endDate) {
        taskData.endDate = new Date(taskData.startDate.getTime());
      }

      // Convert dates to ISO strings for the API
      const updateData = {
        ...taskData,
        startDate: taskData.startDate?.toISOString(),
        endDate: taskData.endDate?.toISOString(),
      };

      const record = await pb.collection("task").update(taskId, updateData);
      const updatedTask = convertTaskRecordToTask(record);

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
    try {
      setStatus("loading");
      console.log("restoreTask", taskId, historyTimestamp, taskData);
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
      await pb.collection("task").delete(taskId);
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
      await updateTask(taskId, { tags: updatedTags });
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
      await updateTask(taskId, { tags: updatedTags });
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
    addTagToTask,
    removeTagFromTask,
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
