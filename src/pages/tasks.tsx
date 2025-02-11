import { Box, Flex, IconButton, HStack, useDisclosure } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

export default function Tasks() {
  const { open: isTaskListOpen, onToggle: toggleTasklist } = useDisclosure({ defaultOpen: true });

  return (
    <Flex direction="column" flex={1}>
      {/* Top Bar */}
      <HStack p={4} borderBottom="1px solid" borderColor="gray.200" justifyContent="space-between">
        <HStack spacing={4}>
          <IconButton aria-label="Toggle Sidebar" onClick={toggleTasklist}>
            {isTaskListOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </IconButton>
          <Box>TODAY</Box>
          <Box>DATE</Box>
        </HStack>

        <HStack spacing={4}>
          <Box>TIME SELECTOR</Box>
          <Box>VIEW SELECTOR</Box>
        </HStack>
      </HStack>

      {/* Resizable Columns */}
      <PanelGroup direction="horizontal" style={{ height: "100%" }}>
        {isTaskListOpen && (
          <>
            <Panel defaultSize={50} minSize={20}>
              <Box h="100%" borderRight="1px solid" borderColor="gray.200" />
            </Panel>

            <PanelResizeHandle style={{ width: "8px", cursor: "col-resize" }}>
              <Box w="full" h="full" bg="gray.100" _hover={{ bg: "blue.100" }} />
            </PanelResizeHandle>
          </>
        )}

        <Panel>
          <Box h="100%" bg="gray.50" />
        </Panel>
      </PanelGroup>
    </Flex>
  );
}
