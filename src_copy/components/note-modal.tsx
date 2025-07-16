import { Box } from "@chakra-ui/react";
import { useNotes } from "../contexts/note-context";
import NoteEdit from "./note-edit";
import { useRef } from "react";
import { AppModal } from "./ui/app-modal";
export default function NoteEditModal() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { selectedNote, setSelectedNote } = useNotes();
  const onClose = () => {
    void setSelectedNote(null);
  };
  return (
    <AppModal
      isOpen={selectedNote !== null}
      onClose={onClose}
      contentRef={contentRef}
      size="lg"
    >
      <Box bg={"black"} color={"brand.4"} height={"90vh"} width={"90vw"}>
        {selectedNote && (
          <NoteEdit
            noteId={selectedNote.id}
            width={undefined}
            height={undefined}
            showToolbar={true}
            showCloseButton={true}
            contentDialogRef={contentRef}
            onComplete={() => {
              void setSelectedNote(null);
            }}
          />
        )}
      </Box>
    </AppModal>
  );
}
