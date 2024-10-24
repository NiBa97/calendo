/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { Flex, VStack } from "@chakra-ui/react";
import AddTask from "../../components/add-task";
import ListTasks from "../../components/list-tasks";
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
