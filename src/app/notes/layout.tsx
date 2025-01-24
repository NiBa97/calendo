"use client";
import { useEffect, useState } from "react";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import { NoteProvider } from "~/contexts/note-context";
import { AttachmentProvider } from "~/contexts/attachment-context";
import { ResizeHandle } from "~/components/resize-handle";
import AppNavbar from "~/components/app-navbar";
import { NoteList } from "~/components/note-list";
import { getLocalStorage, setLocalStorage } from "~/utils/storage";

export default function Layout({ children }: { children: React.ReactNode }) {
  const savedWidth = getLocalStorage("notes-width", "0.3");
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
      setLocalStorage("notes-width", (size.width / window.innerWidth).toString());
      setWidth(size.width);
    }
  };

  return (
    <Box>
      <AppNavbar />
      <Flex
        maxHeight={"calc(100vh - 56px)"}
        width={"calc(100vw -15px)"}
        maxWidth={"100vw"}
        height={"calc(100vh - 56px)"}
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
          handle={<ResizeHandle handleAxis="x" innerRef={null} />}
        >
          <Box width={width}>
            <NoteList />
          </Box>
        </Resizable>
        <Box
          width={`calc(100vw - ${width + 15}px)`}
          maxHeight={"calc(100vh - 56px)"}
          bg={"brand.1"}
          color={"brand.4"}
          className="test123"
        >
          {" "}
          {children}
        </Box>
      </Flex>
    </Box>
  );
}
