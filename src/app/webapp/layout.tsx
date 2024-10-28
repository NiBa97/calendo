"use client";
import { useEffect, useState } from "react";
import { Box, ChakraProvider, Flex, createMultiStyleConfigHelpers, extendTheme } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import { TaskProvider } from "../../contexts/task-context";
import TaskMenu from "~/components/task-menu";
import TaskEditModal from "~/components/task-edit-modal";
import React from "react";
import { ResizeHandle } from "~/components/resize-handle";
import AppNavbar from "~/components/app-navbar";
import { AttachmentProvider } from "~/contexts/attachment-context";

// This function creates a set of function that helps us create multipart component styles.
const helpers = createMultiStyleConfigHelpers(["menu", "item"]);

const Menu = helpers.defineMultiStyleConfig({
  baseStyle: {
    menu: {
      boxShadow: "lg",
      rounded: "lg",
      flexDirection: "column",
      py: "2",
    },
    item: {
      fontWeight: "medium",
      lineHeight: "normal",
      color: "gray.600",
    },
  },
  sizes: {
    sm: {
      item: {
        fontSize: "0.75rem",
        px: 2,
        py: 1,
      },
    },
    md: {
      item: {
        fontSize: "0.875rem",
        px: 3,
        py: 2,
      },
    },
  },
  variants: {
    bold: {
      item: {
        fontWeight: "bold",
      },
      menu: {
        boxShadow: "xl",
      },
    },
    colorful: {
      item: {
        color: "orange.600",
      },
      menu: {
        bg: "orange.100",
      },
    },
  },
  defaultProps: {
    size: "md",
  },
});
const theme = extendTheme({
  colors: {
    brand: {
      1: "#222831",
      2: "#393E46",
      3: "#00ADB5",
      4: "#EEEEEE",
    },
  },
  components: {
    Button: {
      baseStyle: {
        bg: "brand.2",
        color: "brand.4",
        border: "none",
        _hover: {
          bg: "brand.4",
        },
      },
      variants: {
        solid: {
          bg: "brand.2",
          color: "brand.4",
          border: "none",
          _hover: {
            bg: "brand.3",
          },
        },
      },
    },
  },
  Menu,
});

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
    <ChakraProvider theme={theme}>
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
    </ChakraProvider>
  );
}
