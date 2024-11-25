"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Button, HStack, IconButton, Input, VStack, Icon } from "@chakra-ui/react";
import { FaTrash, FaHistory } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useNotes } from "~/contexts/note-context";
import { useRouter } from "next/navigation";
import AttachmentList from "~/components/attachment-list";
import { ParentType } from "@prisma/client";

const EditorComp = dynamic(() => import("~/components/app-editor"), { ssr: false });

export default function NotePage({ params }: { params: { id: string } }) {
  const { notes, updateNote, deleteNote, setSelectedNote } = useNotes();
  const router = useRouter();
  const note = notes.find((n) => n.id === params.id);

  const [noteState, setNoteState] = useState({
    title: note?.title ?? "",
    content: note?.content ?? "",
  });
  const noteStateRef = useRef(noteState);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isDirty = useRef(false);

  useEffect(() => {
    if (note) {
      setSelectedNote(note);
      noteStateRef.current = {
        title: note.title,
        content: note.content ?? "",
      };
      setNoteState({
        title: note.title,
        content: note.content ?? "",
      });
    }
    return () => {
      if (isDirty.current) {
        void handleSave();
      }
      setSelectedNote(null);
    };
  }, [note, setSelectedNote]);

  const handleSave = async () => {
    if (!note?.id) return;

    try {
      await updateNote(note.id, noteStateRef.current);
      isDirty.current = false;
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const debounceSave = () => {
    isDirty.current = true;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      void handleSave();
    }, 2000); // 2 second delay
  };

  const handleChange = (field: keyof typeof noteState, value: string) => {
    noteStateRef.current = { ...noteStateRef.current, [field]: value };
    setNoteState((prev) => ({ ...prev, [field]: value }));
    debounceSave();
  };

  const handleDelete = async () => {
    if (!note?.id) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    await deleteNote(note.id);
    router.push("/notes");
  };

  if (!note) {
    return <Box p={4}>Note not found</Box>;
  }

  return (
    <VStack height="100%" spacing={0} align="stretch" color="brand.4">
      <HStack p={4} borderBottom="1px" borderColor="brand.2" spacing={4}>
        <Input
          value={noteState.title}
          onChange={(e) => handleChange("title", e.target.value)}
          fontSize="xl"
          fontWeight="bold"
          border="none"
          _focus={{ border: "none", boxShadow: "none" }}
          bg="transparent"
        />
        <IconButton aria-label="Note history" icon={<Icon as={FaHistory} />} variant="ghost" />
        <IconButton aria-label="Delete note" icon={<Icon as={FaTrash} />} variant="ghost" onClick={handleDelete} />
      </HStack>

      <Box flex={1} overflow="auto">
        <EditorComp
          markdown={noteState.content}
          handleChange={(field, value) => {
            if (field === "description") {
              handleChange("content", value as string);
            }
          }}
          showToolbar={true}
          parentId={note.id}
          parentType={ParentType.NOTE}
        />
      </Box>

      <AttachmentList parentId={note.id} parentType={ParentType.NOTE} />
    </VStack>
  );
}
