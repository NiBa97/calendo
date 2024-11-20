"use client";
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";
import React from "react";
import { ChakraProvider, createMultiStyleConfigHelpers, extendTheme } from "@chakra-ui/react";
import { TaskProvider } from "./task-context";
import { NoteProvider } from "./note-context";
import { AttachmentProvider } from "./attachment-context";
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
export function Providers(props: { children: React.ReactNode; serverSession: Session | null }) {
  return (
    <SessionProvider session={props.serverSession}>
      <ChakraProvider theme={theme}>
        <AttachmentProvider>
          <TaskProvider>
            <NoteProvider>{props.children}</NoteProvider>
          </TaskProvider>
        </AttachmentProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}
