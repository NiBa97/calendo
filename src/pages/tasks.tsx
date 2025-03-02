import { Box, Flex, Separator, useDisclosure } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ListTasks from "../components/task-list";
import CreateTask from "../components/create-task";
import MainCalendar from "../components/calendar/main-calendar";
import TaskContextMenu from "../components/task-contextmenu";

export default function Tasks() {
  const { open: isTaskListOpen, onToggle: toggleTasklist } = useDisclosure({ defaultOpen: true });

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
          <MainCalendar isTaskListOpen={isTaskListOpen} toggleTasklist={toggleTasklist}></MainCalendar>
        </Panel>
      </PanelGroup>
      <TaskContextMenu />
    </Flex>
  );
}
