import { useState } from "react";
import { Task } from "../types/task.types";

export interface TaskUIState {
  draggingTask: Task | null;
  setDraggingTask: (task: Task | null) => void;
  modalTask: Task | null;
  setModalTask: (task: Task | null) => void;
  temporaryTask: Task | null;
  setTemporaryTask: (task: Task | null) => void;
  contextInformation: { x: number; y: number; task: Task } | undefined;
  setContextInformation: (info: { x: number; y: number; task: Task } | undefined) => void;
}

export const useTaskUI = (): TaskUIState => {
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [temporaryTask, setTemporaryTask] = useState<Task | null>(null);
  const [contextInformation, setContextInformation] = useState<{ x: number; y: number; task: Task } | undefined>(
    undefined
  );

  return {
    draggingTask,
    setDraggingTask,
    modalTask,
    setModalTask,
    temporaryTask,
    setTemporaryTask,
    contextInformation,
    setContextInformation,
  };
};