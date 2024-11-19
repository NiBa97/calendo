"use client";
import { useEffect } from "react";
import { Box, Button, HStack, IconButton, Input, VStack, Icon, Flex } from "@chakra-ui/react";
import { FaTrash, FaHistory } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useNotes } from "~/contexts/note-context";
import { useRouter } from "next/navigation";
import AttachmentList from "~/components/attachment-list";

const EditorComp = dynamic(() => import("~/components/app-editor"), { ssr: false });

export default function NotePage({ params }: { params: { id: string } }) {
  const { notes, updateNote, deleteNote, setSelectedNote } = useNotes();

  const router = useRouter();
  const note = notes.find((n) => n.id === params.id);

  useEffect(() => {
    if (note) {
      setSelectedNote(note);
    }
    return () => setSelectedNote(null);
  }, [note, setSelectedNote]);

  if (!note) {
    return <Box p={4}>Note not found</Box>;
  }

  const handleDelete = async () => {
    await deleteNote(note.id);
    router.push("/notes");
  };

  const handleTitleChange = (newTitle: string) => {
    void updateNote(note.id, { title: newTitle });
  };

  return (
    <VStack height="100%" spacing={0} align="stretch" color={"brand.4"}>
      <HStack p={4} borderBottom="1px" borderColor="brand.2" spacing={4}>
        <Input
          value={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          fontSize="xl"
          fontWeight="bold"
          border="none"
          _focus={{ border: "none", boxShadow: "none" }}
          bg="transparent"
        />
        <IconButton aria-label="Note history" icon={<Icon as={FaHistory} />} variant="ghost" />
        <IconButton aria-label="Delete note" icon={<Icon as={FaTrash} />} variant="ghost" onClick={handleDelete} />
      </HStack>

      <Flex flex={1} overflow="auto" color={"brand.4"}>
        <EditorComp
          markdown={note.content ?? ""}
          handleChange={(field, value) => {
            if (field === "description") {
              void updateNote(note.id, { content: value as string });
            }
          }}
          showToolbar={true}
          taskId={note.id}
        />
      </Flex>

      <AttachmentList taskId={note.id} />
    </VStack>
  );
}
