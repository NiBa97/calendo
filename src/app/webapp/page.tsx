/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { Box } from "@chakra-ui/react";
import AddTask from "../_components/add-task";
import ListTasks from "../_components/list-tasks";
export default function Home() {
  return (
    <Box height={"100%"} width={"100%"}>
      <AddTask />
      <ListTasks />
    </Box>
  );
}
