"use client";
import { useEffect, useState } from "react";
import { Box, Center, Flex, HStack, VStack } from "@chakra-ui/react";
import { Resizable, type ResizeCallbackData } from "react-resizable";
import { TaskProvider } from "../../contexts/task-context";

export default function Layout({
  calendar,
  taskDetails,
  children,
}: {
  calendar: React.ReactNode;
  taskDetails: React.ReactNode;
  children: React.ReactNode;
}) {
  const savedHeight = typeof window !== "undefined" ? localStorage.getItem("height") ?? "0.5" : "0.5";
  const savedWidth = typeof window !== "undefined" ? localStorage.getItem("width") ?? "0.5" : "0.5";

  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;

  const [height, setHeight] = useState<number>(Number(savedHeight) * windowHeight);
  const [width, setWidth] = useState<number>(Number(savedWidth) * windowWidth);

  useEffect(() => {
    const handleResize = () => {
      setHeight(windowHeight * parseFloat(savedHeight));
      setWidth(windowWidth * parseFloat(savedWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onHeightResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    if (size.height > windowHeight * 0.25 && size.height < windowHeight * 0.75) {
      setHeight(size.height);
      localStorage.setItem("height", (size.height / windowHeight).toString());
    }
  };

  const onWidthResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    if (size.width > windowWidth * 0.25 && size.width < windowWidth * 0.75) {
      setWidth(size.width);
      localStorage.setItem("width", (size.width / windowWidth).toString());
    }
  };

  return (
    <TaskProvider>
      <Flex direction={"column"} height={"100%"} maxHeight={"100vh"} bg={"purple"} p={4} color={"#F7FAFC"}>
        <Resizable height={height} width={Infinity} onResize={onHeightResize} resizeHandles={["s"]}>
          <Box width={"100%"} height={height} bg={"green"} position={"relative"}>
            <HStack height={"100%"}>
              <Resizable height={Infinity} width={width} onResize={onWidthResize} resizeHandles={["e"]}>
                <VStack width={width} bg={"gray.600"} position={"relative"} height={"100%"}>
                  {children}
                </VStack>
              </Resizable>

              <Center width={`calc(100% - ${width}px)`} height={"100%"} bg={"gray.700"}>
                {taskDetails}
              </Center>
            </HStack>
          </Box>
        </Resizable>

        <Center width={"100%"} height={`calc(100vh - ${height + 10}px)`} bg={"black"} color={"white"} pt={4}>
          {calendar}
        </Center>
      </Flex>
    </TaskProvider>
  );
}
