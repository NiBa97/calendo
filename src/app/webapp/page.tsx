/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { Box, VStack } from "@chakra-ui/react";
import AddTask from "../_components/add-task";
import ListTasks from "../_components/list-tasks";
export default function Home() {
  return (
    <VStack height={"100%"} width={"100%"} maxHeight={"100%"}>
      <AddTask />
      <ListTasks />
    </VStack>
  );
}
