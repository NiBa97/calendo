import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaTrash, FaHistory } from "react-icons/fa";
import { Flex, Box, Button } from "@chakra-ui/react";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import Editor from "./editor/editor";
import { useNotes } from "../contexts/note-context";
import NoteChangelog from "./note-changelog";
import TitleInput from "./ui/title-input";

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

  const noteDataRef = useRef({
    title: "",
    content: "",
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      const newTitle = note.title;
      const newContent = note.content ?? "";

      setTitle(newTitle);
      setContent(newContent);

      noteDataRef.current = {
        title: newTitle,
        content: newContent,
      };

      if (ref.current) {
        ref.current.setMarkdown(newContent);
      }
    }
  }, [note, noteId]);

  const handleSave = async () => {
    if (noteId) {
      await updateNote(noteId, noteDataRef.current);
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

  const handleTitleChange = (newTitle: string) => {
    noteDataRef.current.title = newTitle;
    setTitle(newTitle);
    debounceSave();
  };

  const handleContentChange = (newContent: string) => {
    noteDataRef.current.content = newContent;
    debounceSave();
  };

  const handleDelete = async () => {
    if (noteId) {
      await deleteNote(noteId);
      onComplete?.();
    }
  };
  const [showChangelog, setShowChangelog] = useState(false);

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
          <TitleInput placeholder="Note title" value={title} onChange={handleTitleChange} />
          <Button aria-label="Delete" bg="brand.1" onClick={handleDelete} color="brand.4" size="lg" borderRadius="none">
            <FaTrash />
          </Button>
          <Button
            aria-label="History"
            bg="brand.1"
            onClick={() => setShowChangelog(true)}
            color="brand.4"
            size="lg"
            borderRadius="none"
          >
            <FaHistory />
          </Button>
          {showCloseButton && (
            <Button aria-label="Close" bg="brand.1" onClick={onComplete} color="brand.4" size="lg" borderRadius="none">
              <FaTimes />
            </Button>
          )}
        </Flex>
      </Box>

      <Editor markdown={content} onChange={handleContentChange} editorRef={ref} showToolbar={showToolbar} />
      <NoteChangelog
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
        noteId={noteId}
        originalContent={content}
        originalTitle={title}
      />
    </Flex>
  );
};

export default NoteEdit;
