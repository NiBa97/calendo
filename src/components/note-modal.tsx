import { Box } from "@chakra-ui/react";
import { DialogBody, DialogContent, DialogRoot } from "./ui/dialog";
import { useNotes } from "../contexts/note-context";
import NoteEdit from "./note-edit";
export default function NoteEditModal() {
  const { selectedNote, setSelectedNote } = useNotes();
  const onClose = () => {
    void setSelectedNote(null);
  };
  return (
    <DialogRoot
      open={selectedNote !== null}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <DialogContent bg={"transparent"} color={"brand.4"} height={"90vh"} width={"90vw"} maxH={"90vh"} maxW={"90vw"}>
        <DialogBody height={"90vh"} width={"90vw"} p={0}>
          <Box bg={"black"} color={"brand.4"} height={"90vh"} width={"90vw"}>
            {selectedNote && (
              <NoteEdit
                noteId={selectedNote.id}
                width={undefined}
                height={undefined}
                showToolbar={true}
                showCloseButton={true}
              ></NoteEdit>
            )}
          </Box>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
