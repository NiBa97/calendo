import { Box, Flex, Separator, useDisclosure, Text, IconButton, Icon } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ListTasks from "../components/task-list";
import CreateTask from "../components/create-task";
import MainCalendar from "../components/calendar/main-calendar";
import TaskContextMenu from "../components/task-contextmenu";
import { useIsMobile } from "../utils/responsive";

export default function Tasks() {
  const { open: isTaskListOpen, onToggle: toggleTasklist } = useDisclosure({ defaultOpen: false });
  const isMobile = useIsMobile();

  // Mobile gets day view only, desktop gets all views
  const availableViews = isMobile 
    ? { day: "Day" }
    : undefined; // undefined uses default views (month, week, day, 3-day)

  if (isMobile) {
    return (
      <Flex direction="column" flex={1}>
        {isTaskListOpen && (
          <Box className="mobile-task-panel">
            <Flex p={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.200">
              <Text fontSize="lg" fontWeight="bold">Tasks</Text>
              <IconButton
                aria-label="Close task panel"
                variant="ghost"
                onClick={toggleTasklist}
              >
                <Icon as={FiX} />
              </IconButton>
            </Flex>
            <Box p={4} flex={1} overflow="auto">
              <CreateTask />
              <Separator my={2} />
              <ListTasks />
            </Box>
          </Box>
        )}
        
        <MainCalendar 
          isTaskListOpen={isTaskListOpen} 
          toggleTasklist={toggleTasklist}
          availableViews={availableViews}
        />
        <TaskContextMenu />
      </Flex>
    );
  }

  return (
    <Flex direction="column" flex={1}>
      <PanelGroup direction="horizontal" style={{ height: "100%" }}>
        {isTaskListOpen && (
          <>
            <Panel defaultSize={50} minSize={20}>
              <Box p={2}>
                <CreateTask></CreateTask>
                <Separator my={2}></Separator>
                <ListTasks></ListTasks>
              </Box>
            </Panel>

            <PanelResizeHandle style={{ width: "12px", cursor: "col-resize" }}>
              <Flex
                w="full"
                h="full"
                justifyContent="center"
                alignItems="center"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  height: "60px",
                  width: "4px",
                  borderRadius: "full",
                  bg: "gray.300",
                  transition: "all 0.2s ease",
                }}
                _hover={{
                  _before: {
                    bg: "brand.3",
                    height: "80px",
                    boxShadow: "0 0 8px rgba(0, 173, 181, 0.5)",
                  },
                }}
              />
            </PanelResizeHandle>
          </>
        )}

        <Panel>
          <MainCalendar 
            isTaskListOpen={isTaskListOpen} 
            toggleTasklist={toggleTasklist}
            availableViews={availableViews}
          />
        </Panel>
      </PanelGroup>
      <TaskContextMenu />
    </Flex>
  );
}
