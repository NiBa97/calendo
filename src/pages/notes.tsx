import { Box, Flex } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { NoteList } from "../components/note-list";
import { useParams } from "react-router-dom";
import NoteEdit from "../components/note-edit";

export default function Notes() {
  const { id } = useParams(); // This will get the note ID from the URL

  return (
    <Flex direction="column" flex={1} h="100vh" overflow="hidden">
      {/* Resizable Columns */}
      <PanelGroup direction="horizontal" style={{ height: "100%" }}>
        <Panel defaultSize={30} minSize={20}>
          <Box h="100%" overflow="auto">
            <NoteList />
          </Box>
        </Panel>

        <PanelResizeHandle style={{ width: "8px", cursor: "col-resize" }}>
          <Box w="full" h="full" bg="gray.100" _hover={{ bg: "blue.100" }} />
        </PanelResizeHandle>

        <Panel>
          <Box flex={1} height="100%" overflow="auto">
            {id ? <NoteEdit noteId={id} showCloseButton={false} /> : <Box p={4}>Please select a note</Box>}
          </Box>
        </Panel>
      </PanelGroup>
    </Flex>
  );
}
