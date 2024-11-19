"use client";
import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import { TaskProvider } from "../../contexts/task-context";
import TaskMenu from "~/components/task-menu";
import TaskEditModal from "~/components/task-edit-modal";
import React from "react";
import { ResizeHandle } from "~/components/resize-handle";
import AppNavbar from "~/components/app-navbar";
import { AttachmentProvider } from "~/contexts/attachment-context";

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
      <AttachmentProvider>
        <AppNavbar></AppNavbar>
        <Flex
          maxHeight={"calc(100vh - 50px)"}
          width={"100vw"}
          height={"calc(100vh - 50px)"}
          bg={"brand.1"}
          color={"brand.4"}
          gap={2}
        >
          <Resizable
            axis="x"
            width={width}
            onResize={onWidthResize}
            resizeHandles={["e"]}
            className={"resize-x"}
            handle={<ResizeHandle handleAxis={"x"} innerRef={null} />}
          >
            <Box width={width}>{children}</Box>
          </Resizable>
          <Box
            width={`calc(100vw - ${width}px)`}
            maxHeight={"calc(100vh - 50px)"}
            bg={"brand.1"}
            color={"brand.4"}
            className="test123"
          >
            {calendar}
          </Box>
          <TaskMenu />
          <TaskEditModal />
        </Flex>
      </AttachmentProvider>
    </TaskProvider>
  );
}
