"use client";
import { Box } from "@chakra-ui/react";
import TempTask from "~/app/_components/edit-task";
import { useTasks } from "~/app/_contexts/task-context";
export default function Home({ params: { id: taskId } }: { params: { id: string } }) {
  const { tasks } = useTasks();
  let selectedTask: Task | undefined = undefined;
  tasks.forEach((task) => {
    console.log(task.id, taskId, task.id === taskId);
    if (task.id === taskId) {
      selectedTask = task;
    }
  });
  console.log(tasks);
  return <>{selectedTask && <TempTask task={selectedTask} />}</>;
}
2;
