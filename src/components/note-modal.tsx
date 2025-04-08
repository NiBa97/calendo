import { Box, Dialog } from "@chakra-ui/react";
import { useNotes } from "../contexts/note-context";
import NoteEdit from "./note-edit";
import { useRef } from "react";
export default function NoteEditModal() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { selectedNote, setSelectedNote } = useNotes();
  const onClose = () => {
    void setSelectedNote(null);
  };
  return (
    <Dialog.Root
      open={selectedNote !== null}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          ref={contentRef}
          bg={"transparent"}
          color={"brand.4"}
          height={"90vh"}
          width={"90vw"}
          maxH={"90vh"}
          maxW={"90vw"}
        >
          <Dialog.Body height={"90vh"} width={"90vw"} p={0}>
            <Box bg={"black"} color={"brand.4"} height={"90vh"} width={"90vw"}>
              {selectedNote && (
                <NoteEdit
                  noteId={selectedNote.id}
                  width={undefined}
                  height={undefined}
                  showToolbar={true}
                  showCloseButton={true}
                  contentDialogRef={contentRef}
                ></NoteEdit>
              )}
            </Box>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
