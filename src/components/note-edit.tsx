import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { Input, Flex, IconButton, Box, Button } from "@chakra-ui/react";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import Editor from "./editor/editor";
import { useNotes } from "../contexts/note-context";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteEditProps {
  noteId: string;
  height?: number | string;
  width?: number | string;
  showCloseButton?: boolean;
  showToolbar?: boolean;
  onComplete?: () => void;
}

const NoteEdit = ({
  noteId,
  height = undefined,
  width = undefined,
  showCloseButton = true,
  showToolbar = true,
  onComplete,
}: NoteEditProps) => {
  const ref = React.useRef<MDXEditorMethods>(null);
  const { notes, updateNote, deleteNote } = useNotes();
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const note = notes.find((n) => n.id === noteId);

  const [noteState, setNoteState] = useState({
    title: note?.title ?? "",
    content: note?.content ?? "",
  });
  const noteStateRef = useRef(noteState);

  useEffect(() => {
    if (note) {
      setNoteState({
        title: note.title,
        content: note.content ?? "",
      });
      noteStateRef.current = {
        title: note.title,
        content: note.content ?? "",
      };
    }
  }, [note]);

  const handleSave = async () => {
    if (noteId) {
      await updateNote(noteId, noteStateRef.current);
    }
  };

  const debounceSave = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      void handleSave();
    }, 2000);
  };

  const handleChange = (field: keyof Note, value: string) => {
    noteStateRef.current = { ...noteStateRef.current, [field]: value };
    setNoteState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    debounceSave();
  };

  const handleDelete = async () => {
    if (noteId) {
      await deleteNote(noteId);
      onComplete?.();
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
    return <Box p={4}>Note not found</Box>;
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
      <Box as="form" width="100%" borderBottom="2px solid" borderColor="brand.2">
        <Flex alignItems="center">
          <Input
            placeholder="Note title"
            bg="brand.1"
            border="none"
            type="text"
            size="lg"
            fontWeight="600"
            value={noteState.title}
            onChange={(e) => handleChange("title", e.target.value)}
            _focus={{ border: "none", outline: "none", boxShadow: "none" }}
            borderRadius="none"
          />
          <Button aria-label="Delete" bg="brand.1" onClick={handleDelete} color="brand.4" size="lg" borderRadius="none">
            <FaTrash />
          </Button>
          {showCloseButton && (
            <Button aria-label="Close" bg="brand.1" onClick={onComplete} color="brand.4" size="lg" borderRadius="none">
              <FaTimes />
            </Button>
          )}
        </Flex>
      </Box>

      <Editor
        markdown={noteState.content}
        onChange={(content) => handleChange("content", content)}
        editorRef={ref}
        showToolbar={showToolbar}
        parentId={noteId}
      />
    </Flex>
  );
};

export default NoteEdit;
