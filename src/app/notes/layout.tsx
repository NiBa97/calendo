"use client";
import { useEffect, useState } from "react";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import { NoteProvider } from "~/contexts/note-context";
import { AttachmentProvider } from "~/contexts/attachment-context";
import { ResizeHandle } from "~/components/resize-handle";
import AppNavbar from "~/components/app-navbar";
import { NoteList } from "~/components/note-list";

export default function Layout({ children }: { children: React.ReactNode }) {
  const savedWidth = localStorage.getItem("notes-width") ?? "0.3";
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth * parseFloat(savedWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [savedWidth]);

  const onWidthResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    event.preventDefault();
    if (window === undefined) return;
    if (size.width > window.innerWidth * 0.2 && size.width < window.innerWidth * 0.8) {
      localStorage.setItem("notes-width", (size.width / window.innerWidth).toString());
      setWidth(size.width);
    }
  };

  return (
    <Box>
      <AppNavbar />
      <Flex height="calc(100vh - 50px)" width="100vw" bg="brand.1" color="brand.4" gap={2}>
        <Resizable
          axis="x"
          width={width}
          onResize={onWidthResize}
          resizeHandles={["e"]}
          className={"resize-x"}
          handle={<ResizeHandle handleAxis="x" innerRef={null} />}
        >
          <Box width={width}>
            <NoteList />
          </Box>
        </Resizable>
        <Box width={`calc(100vw - ${width}px)`} height="100%" bg="brand.1" color="brand.4" overflow="auto">
          {children}
        </Box>
      </Flex>
    </Box>
  );
}
