"use client";
import { useEffect, useState } from "react";
import { Box, Center, Flex, HStack, VStack, Wrap, WrapItem } from "@chakra-ui/react";
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
        <Box minWidth={width}>
          <Resizable axis="x" width={width} onResize={onWidthResize} resizeHandles={["e"]} className={"resize-x"}>
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
                  {children}
                </Box>
              </Resizable>
              <Box height={`calc(100vh - ${height}px)`} width={"100%"} bg={"black"} color={"white"}>
                {taskDetails}
              </Box>
            </div>
          </Resizable>
        </Box>
        <Box width={`calc(100vw - ${width}px)`} maxHeight={"100vh"} bg={"black"} color={"white"}>
          {calendar}
        </Box>
      </Flex>
      {/* <Flex direction={"column"} height={"100%"} maxHeight={"100vh"} bg={"purple"} p={4} color={"#F7FAFC"}>
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
      </Flex> */}
    </TaskProvider>
  );
}
