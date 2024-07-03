"use client";
import { useEffect, useState } from "react";
import { Box, Center, Flex, HStack, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import AddTask from "~/components/add-task";
import ListTasks from "~/components/list-tasks";
import TaskMenu from "~/components/task-menu";
import { useTasks } from "~/contexts/task-context";
import { Task } from "@prisma/client";
import TempTask from "~/components/edit-task";

export default function Home({ params: { id: taskId } }: { params: { id: string } }) {
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const savedHeight = localStorage.getItem("height") ?? "0.5";
    const savedWidth = localStorage.getItem("width") ?? "0.5";
    const handleResize = () => {
      setHeight(window.innerHeight * parseFloat(savedHeight));
      setWidth(window.innerWidth * parseFloat(savedWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onHeightResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    event.preventDefault();
    if (window === undefined) return;
    if (size.height > window.innerHeight * 0.25 && size.height < window.innerHeight * 0.75) {
      setHeight(size.height);
      localStorage.setItem("height", (size.height / window.innerHeight).toString());
    } else if (size.height < window.innerHeight * 0.25) {
      localStorage.setItem("height", "0.25");
      setHeight(window.innerHeight * 0.25);
    } else if (size.height > window.innerHeight * 0.75) {
      localStorage.setItem("height", "0.75");
      setHeight(window.innerHeight * 0.75);
    }
  };
  const { tasks } = useTasks();
  let selectedTask: Task | undefined = undefined;
  tasks.forEach((task) => {
    if (task.id === taskId) {
      selectedTask = task;
    }
  });
  return (
    <div>
      <Resizable
        axis="y"
        height={height}
        width={width}
        onResize={onHeightResize}
        resizeHandles={["s"]}
        className={"resize-y"}
      >
        <Box height={height} width={"100%"} bg={"green"} position={"relative"}>
          <VStack height={"100%"} width={"100%"} maxHeight={"100%"}>
            <AddTask />
            <ListTasks />
          </VStack>
        </Box>
      </Resizable>
      <Box height={`calc(100vh - ${height}px)`} width={"100%"} bg={"black"} color={"white"}>
        {selectedTask && <TempTask task={selectedTask} />}
      </Box>
    </div>
  );
}
