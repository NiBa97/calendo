"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Input, IconButton, Flex } from "@chakra-ui/react";
import { FaTrash, FaHistory } from "react-icons/fa";
import dynamic from "next/dynamic";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import { useRouter } from "next/navigation";
import AttachmentList from "./attachment-list";
import { useNotes } from "~/contexts/note-context";

const EditorComp = dynamic(() => import("./app-editor"), { ssr: false });

interface NoteEditorProps {
  noteId: string;
  height?: number | string;
  width?: number | string;
  showToolbar?: boolean;
}

export default function NoteEditor({
  noteId,
  height = undefined,
  width = undefined,
  showToolbar = true,
}: NoteEditorProps) {
  const { notes, updateNote, deleteNote, setSelectedNote } = useNotes();
  const router = useRouter();
  const ref = useRef<MDXEditorMethods>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const note = notes.find((n) => n.id === noteId);

  const [noteState, setNoteState] = useState({
    title: note?.title ?? "",
    content: note?.content ?? "",
  });
  const noteStateRef = useRef(noteState);

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
    return () => setSelectedNote(null);
  }, [note, setSelectedNote]);

  const handleSave = async () => {
    if (note?.id) {
      await updateNote(note.id, noteStateRef.current);
    }
  };

  const debounceSave = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      void handleSave();
    }, 5000);
  };

  const handleChange = (field: keyof typeof noteState, value: string) => {
    noteStateRef.current = { ...noteStateRef.current, [field]: value };
    setNoteState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    debounceSave();
  };

  const handleDelete = async () => {
    if (note) {
      await deleteNote(note.id);
      router.push("/notes");
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        void handleSave();
      }
    };
  }, []);

  if (!note) {
    return null;
  }

  return (
    <Flex
      direction="column"
      width={width ?? "100%"}
      height={height ?? "100%"}
      bg="brand.1"
      maxHeight="100%"
      overflow="hidden"
    >
      <Input
        placeholder="Note title"
        bg="brand.1"
        border="none"
        type="text"
        size="lg"
        fontWeight="600"
        value={noteState.title}
        _focus={{ border: "none", outline: "none", boxShadow: "none" }}
        onChange={(e) => handleChange("title", e.target.value)}
        borderRadius="none"
      />
      <IconButton
        aria-label="Note history"
        icon={<FaHistory />}
        variant="ghost"
        size="lg"
        position="absolute"
        right="48px"
        top="8px"
      />
      <IconButton
        aria-label="Delete note"
        icon={<FaTrash />}
        variant="ghost"
        size="lg"
        position="absolute"
        right="8px"
        top="8px"
        onClick={handleDelete}
      />

      <Box flex={1} overflow="auto">
        <EditorComp
          markdown={noteState.content}
          handleChange={(field, value) => {
            console.log(field, value);
            if (field === "description") {
              handleChange("content", value as string);
            }
          }}
          showToolbar={showToolbar}
          taskId={note.id}
          editorRef={ref}
        />
      </Box>

      <AttachmentList taskId={note.id} />
    </Flex>
  );
}
