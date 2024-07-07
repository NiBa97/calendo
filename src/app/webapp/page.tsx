/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { Box, Flex, VStack } from "@chakra-ui/react";
import AddTask from "../../components/add-task";
import ListTasks from "../../components/list-tasks";
import { useTasks } from "~/contexts/task-context";
import TaskMenu from "~/components/task-menu";
import { Resizable } from "react-resizable";
export default function Home() {
  return (
    <Flex height={"100%"} width={"100%"} bg={"brand.1"} position={"relative"}>
      <VStack height={"100%"} width={"100%"} maxHeight={"100%"} gap={0}>
        <AddTask />
        <ListTasks />
      </VStack>
    </Flex>
  );
}
