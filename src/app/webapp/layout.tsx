"use client";
import { useEffect, useState } from "react";
import { Box, Center, Flex, HStack, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import { TaskProvider } from "../../contexts/task-context";
import TaskMenu from "~/components/task-menu";
import TaskEditModal from "~/components/task-edit-modal";

export default function Layout({ calendar, children }: { calendar: React.ReactNode; children: React.ReactNode }) {
  const savedWidth = localStorage.getItem("width") ?? "0.5";
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth * parseFloat(savedWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onWidthResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    event.preventDefault();
    if (window === undefined) return;
    if (size.width > window.innerWidth * 0.25 && size.width < window.innerWidth * 0.75) {
      localStorage.setItem("width", (size.width / window.innerWidth).toString());
      setWidth(size.width);
    }
  };

  return (
    <TaskProvider>
      <Flex maxHeight={"100vh"} width={"100vw"} height={"100vh"} bg={"purple"} color={"#F7FAFC"}>
        <Resizable axis="x" width={width} onResize={onWidthResize} resizeHandles={["e"]} className={"resize-x"}>
          <Box width={width}>{children}</Box>
        </Resizable>
        <Box width={`calc(100vw - ${width}px)`} maxHeight={"100vh"} bg={"black"} color={"white"} className="test123">
          {calendar}
        </Box>
        <TaskMenu />
        <TaskEditModal />
      </Flex>
    </TaskProvider>
  );
}
