"use client";
import { type Task } from "@prisma/client";
import TempTask from "~/app/_components/edit-task";
import { useTasks } from "~/app/_contexts/task-context";
export default function Home({ params: { id: taskId } }: { params: { id: string } }) {
  const { tasks } = useTasks();
  let selectedTask: Task | undefined = undefined;
  tasks.forEach((task) => {
    if (task.id === taskId) {
      selectedTask = task;
    }
  });
  return <>{selectedTask && <TempTask task={selectedTask} />}</>;
}
2;
