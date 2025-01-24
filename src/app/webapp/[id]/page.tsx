"use client";
import { useEffect, useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import AddTask from "~/components/add-task";
import ListTasks from "~/components/list-tasks";
import { useTasks } from "~/contexts/task-context";
import { type Task } from "@prisma/client";
import TempTask from "~/components/edit-task";
import { ResizeHandle } from "~/components/resize-handle";
import { getLocalStorage, setLocalStorage } from "~/utils/storage";

export default function Home({ params: { id: taskId } }: { params: { id: string } }) {
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const savedHeight = getLocalStorage("height", "0.5");
    const savedWidth = getLocalStorage("width", "0.5");
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
      setLocalStorage("height", (size.height / window.innerHeight).toString());
    } else if (size.height < window.innerHeight * 0.25) {
      setLocalStorage("height", "0.25");
      setHeight(window.innerHeight * 0.25);
    } else if (size.height > window.innerHeight * 0.75) {
      setLocalStorage("height", "0.75");
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
        handle={<ResizeHandle handleAxis={"y"} innerRef={null} />}
      >
        <Box height={height} width={"100%"} bg={"brand.1"} position={"relative"}>
          <VStack height={"100%"} width={"100%"} maxHeight={"100%"}>
            <AddTask />
            <ListTasks />
          </VStack>
        </Box>
      </Resizable>
      <Box height={`calc(100vh - ${height}px - 50px)`} width={"100%"} bg={"brand.1"} color={"brand.4"} pt={"10px"}>
        {selectedTask && <TempTask task={selectedTask} height={undefined} width={"100%"} />}
      </Box>
    </div>
  );
}
