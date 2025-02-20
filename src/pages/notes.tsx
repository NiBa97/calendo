import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { NoteList } from "../components/note-list";
import { useParams } from "react-router-dom";

export default function Notes() {
  const { open: isNoteListOpen, onToggle: toggleNotelist } = useDisclosure({ defaultOpen: true });
  const { id } = useParams(); // This will get the note ID from the URL

  return (
    <Flex direction="column" flex={1}>
      {/* Resizable Columns */}
      <PanelGroup direction="horizontal" style={{ height: "100%" }}>
        {isNoteListOpen && (
          <>
            <Panel defaultSize={50} minSize={20}>
              <NoteList />
            </Panel>

            <PanelResizeHandle style={{ width: "8px", cursor: "col-resize" }}>
              <Box w="full" h="full" bg="gray.100" _hover={{ bg: "blue.100" }} />
            </PanelResizeHandle>
          </>
        )}

        <Panel>
          <Box p={4}>{id ? <h1>Displaying note with ID: {id}</h1> : <h1>Please select a note</h1>}</Box>
        </Panel>
      </PanelGroup>
    </Flex>
  );
}
