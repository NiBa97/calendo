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
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };
  useEffect(() => {
    setHeight(window.innerHeight / 2);
    setWidth(window.innerWidth / 2);
  }, []);

  const onHeightResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    if (size.height > window.innerHeight * 0.25 && size.height < window.innerHeight * 0.75) {
      setHeight(size.height);
    }
  };

  const onWidthResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    if (size.width > window.innerWidth * 0.25 && size.width < window.innerWidth * 0.75) {
      setWidth(size.width);
    }
  };

  return (
    <main>
      <TaskProvider>
        <Flex direction={"column"} height={"100%"} bg={"purple"} p={4}>
          <Resizable height={height} width={Infinity} onResize={onHeightResize} resizeHandles={["s"]}>
            <Box width={"100%"} height={height} bg={"green"} position={"relative"}>
              <HStack height={"100%"}>
                <Resizable height={Infinity} width={width} onResize={onWidthResize} resizeHandles={["e"]}>
                  <VStack className="box" width={width} bg={"blue"} position={"relative"} height={"100%"}>
                    <AddTask />
                    <ListTasks onTaskClick={handleTaskClick} />
                  </VStack>
                </Resizable>

                <Center width={`calc(100% - ${width}px)`} height={"100%"} bg={"yellow"}>
                  {selectedTask && <TempTask task={selectedTask} />}
                </Center>
              </HStack>
            </Box>
          </Resizable>

          <Center width={"100%"} height={`calc(100vh - ${height + 10}px)`} bg={"black"} color={"white"}>
            <span>Celendar</span>
          </Center>
        </Flex>
      </TaskProvider>
    </main>
  );
}
