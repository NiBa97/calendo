import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ListTasks from "../components/task-list";
import CreateTask from "../components/create-task";
import MainCalendar from "../components/calendar/main-calendar";

export default function Tasks() {
  const { open: isTaskListOpen, onToggle: toggleTasklist } = useDisclosure({ defaultOpen: true });

  return (
    <Flex direction="column" flex={1}>
      {/* Resizable Columns */}
      <PanelGroup direction="horizontal" style={{ height: "100%" }}>
        {isTaskListOpen && (
          <>
            <Panel defaultSize={50} minSize={20}>
              <CreateTask></CreateTask>
              <ListTasks></ListTasks>
            </Panel>

            <PanelResizeHandle style={{ width: "8px", cursor: "col-resize" }}>
              <Box w="full" h="full" bg="gray.100" _hover={{ bg: "blue.100" }} />
            </PanelResizeHandle>
          </>
        )}

        <Panel>
          <MainCalendar isTaskListOpen={isTaskListOpen} toggleTasklist={toggleTasklist}></MainCalendar>
        </Panel>
      </PanelGroup>
    </Flex>
  );
}
