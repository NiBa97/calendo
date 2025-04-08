import { useState, useEffect, useRef } from "react";
import { FaTimes, FaHistory, FaTrash, FaTags, FaEllipsisV } from "react-icons/fa";
import { Box, Button, Flex, Menu, Portal } from "@chakra-ui/react";
import Editor from "./editor/editor";
import TitleInput from "./ui/title-input";
import { useNotes } from "../contexts/note-context";
import { TagSelector, TagBadges } from "./tag-selector";
import NoteChangelog from "./note-changelog";
import { MDXEditorMethods } from "@mdxeditor/editor";

interface NoteEditProps {
  noteId: string;
  width?: string | number;
  height?: string | number;
  onComplete?: () => void;
  showCloseButton?: boolean;
  showToolbar?: boolean;
  contentDialogRef?: React.MutableRefObject<HTMLDivElement | null> | null;
}

interface NoteState {
  title: string;
  content: string;
}

const NoteEdit = ({
  noteId,
  width,
  height,
  onComplete,
  showCloseButton = false,
  showToolbar = true,
  contentDialogRef = null,
}: NoteEditProps) => {
  const { notes, updateNote, deleteNote, addTagToNote, removeTagFromNote } = useNotes();
  const note = notes.find((n) => n.id === noteId);
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [localTags, setLocalTags] = useState<string[]>(note?.tags || []);
  const [showChangelog, setShowChangelog] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<MDXEditorMethods>(null);
  const noteStateRef = useRef<NoteState>({
    title: note?.title || "",
    content: note?.content || "",
  });

  // Update local tags whenever note.tags changes
  useEffect(() => {
    if (note?.tags) {
      setLocalTags(note.tags);
    }
  }, [note?.tags]);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      noteStateRef.current = {
        title: note.title || "",
        content: note.content || "",
      };
    }
  }, [note]);

  useEffect(() => {
    return () => {
      // Save on unmount if needed
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        handleSave();
      }
    };
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    noteStateRef.current = { ...noteStateRef.current, title: newTitle };
    debounceSave();
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    noteStateRef.current = { ...noteStateRef.current, content: newContent };
    debounceSave();
  };

  const handleSave = async () => {
    if (note) {
      try {
        await updateNote(noteId, noteStateRef.current);
      } catch (error) {
        console.error("Failed to save note:", error);
      }
    }
  };

  const debounceSave = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleSave();
    }, 5000);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  // Handle tag selection with local state update
  const handleTagSelect = (tagId: string) => {
    const updatedTags = [...localTags];
    if (!updatedTags.includes(tagId)) {
      updatedTags.push(tagId);
      setLocalTags(updatedTags);
    }
    addTagToNote(noteId, tagId);
    setIsTagDialogOpen(false);
  };

  // Handle tag removal with local state update
  const handleTagRemove = (tagId: string) => {
    const updatedTags = localTags.filter((id) => id !== tagId);
    setLocalTags(updatedTags);
    removeTagFromNote(noteId, tagId);
  };

  if (!note) return null;

  return (
    <>
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
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  aria-label="More options"
                  bg="brand.1"
                  color="brand.4"
                  size="lg"
                  borderRadius="none"
                  _hover={{ bg: "brand.2" }}
                >
                  <FaEllipsisV />
                </Button>
              </Menu.Trigger>
              <Portal container={contentDialogRef ?? undefined}>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item onClick={() => setIsTagDialogOpen(true)} value="tags">
                      <FaTags style={{ marginRight: "8px" }} />
                      Manage Tags
                    </Menu.Item>
                    <Menu.Item onClick={handleDelete} value="delete">
                      <FaTrash style={{ marginRight: "8px" }} />
                      Delete Note
                    </Menu.Item>
                    <Menu.Item onClick={() => setShowChangelog(true)} value="history">
                      <FaHistory style={{ marginRight: "8px" }} />
                      View History
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            {showCloseButton && (
              <Button
                aria-label="Close"
                bg="brand.1"
                onClick={onComplete}
                color="brand.4"
                size="lg"
                borderRadius="none"
              >
                <FaTimes />
              </Button>
            )}
          </Flex>
        </Box>

        {localTags.length > 0 && (
          <Box p={2} borderBottom="1px solid" borderColor="brand.2">
            <Flex align="center" justify="space-between">
              <TagBadges tagIds={localTags} onRemove={handleTagRemove} />
            </Flex>
          </Box>
        )}

        <Editor markdown={content} onChange={handleContentChange} editorRef={ref} showToolbar={showToolbar} />
      </Flex>

      <TagSelector
        selectedTags={localTags}
        onTagSelect={handleTagSelect}
        onTagRemove={handleTagRemove}
        isOpen={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
      />

      <NoteChangelog
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
        noteId={noteId}
        originalContent={content}
        originalTitle={title}
      />
    </>
  );
};

export default NoteEdit;
