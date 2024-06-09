/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { useEffect, useState } from "react";
import { Box, Center, Flex, HStack, VStack } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import { TaskProvider } from "../_contexts/task-context";
import TempTask from "../_components/edit-task";
import AddTask from "../_components/add-task";
import ListTasks from "../_components/list-tasks";
import { type Task } from "@prisma/client";
export default function Home() {
  return (
    <Box height={"100%"} width={"100%"}>
      <AddTask />
      <ListTasks />
    </Box>
  );
}
