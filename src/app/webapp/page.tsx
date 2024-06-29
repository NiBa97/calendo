/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { VStack } from "@chakra-ui/react";
import AddTask from "../../components/add-task";
import ListTasks from "../../components/list-tasks";
import { useTasks } from "~/contexts/task-context";
import TaskMenu from "~/components/task-menu";
export default function Home() {
  const { contextInformation, setContextInformation } = useTasks();
  return (
    <VStack height={"100%"} width={"100%"} maxHeight={"100%"}>
      <AddTask />
      <ListTasks />
      {contextInformation && (
        <TaskMenu
          task={contextInformation.task}
          x={contextInformation.x}
          y={contextInformation.y}
          onClose={() => {
            setContextInformation(undefined);
          }}
        />
      )}
    </VStack>
  );
}
