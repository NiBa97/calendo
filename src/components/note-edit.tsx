import { useState, useEffect, useRef } from "react";
import { FaTimes, FaHistory, FaTrash, FaEllipsisV, FaArchive, FaBox } from "react-icons/fa";
import { Box, Flex, Menu, Portal, VStack } from "@chakra-ui/react";
import { BrandButton } from "./ui/brand-button";
import { IconActionButton } from "./ui/icon-action-button";
import Editor from "./editor/editor";
import TitleInput from "./ui/title-input";
import { useNotes } from "../contexts/note-context";
import { TagBadges } from "./ui/tag-badges";
import NoteChangelog from "./note-changelog";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { TagMenu } from "./tag-menu";

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
  const { notes, updateNote, deleteNote, addTagToNote, removeTagFromNote, archiveNote, unarchiveNote } = useNotes();
  const note = notes.find((n) => n.id === noteId);
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [localTags, setLocalTags] = useState<string[]>(note?.tags || []);
  const [showChangelog, setShowChangelog] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<MDXEditorMethods>(null);
  const noteStateRef = useRef<NoteState>({
    title: note?.title || "",
    content: note?.content || "",
  });

  useEffect(() => {
    if (note?.tags) {
      setLocalTags(note.tags);
    }
  }, [note?.tags]);

  useEffect(() => {
    if (note) {
      noteStateRef.current = {
        title: note.title || "",
        content: note.content || "",
      };
      if (ref.current) {
        ref.current.setMarkdown(note.content || "");
      }
      setTitle(note.title || "");
      setContent(note.content || "");
    }
  }, [note]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        handleSave();
      }
    };
  }, []);

  const handleTitleChange = (newTitle: string) => {
    if (note?.status) return;
    setTitle(newTitle);
    noteStateRef.current = { ...noteStateRef.current, title: newTitle };
    debounceSave();
  };

  const handleContentChange = (newContent: string) => {
    if (note?.status) return;
    setContent(newContent);
    noteStateRef.current = { ...noteStateRef.current, content: newContent };
    debounceSave();
  };

  const handleSave = async () => {
    if (note && !note.status) {
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
    }, 2000);
  };

  const handleDelete = async () => {
    if (!note) return;
    try {
      if (!note.status) {
        alert("Please archive the note before deleting it.");
        return;
      }
      if (confirm("Are you sure you want to delete this note?")) {
        await deleteNote(noteId);
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveNote(noteId);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to archive note:", error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveNote(noteId);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to unarchive note:", error);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (note?.status) return;
    const isSelected = localTags.includes(tagId);
    let updatedTags;
    if (isSelected) {
      updatedTags = localTags.filter((id) => id !== tagId);
      removeTagFromNote(noteId, tagId);
    } else {
      updatedTags = [...localTags, tagId];
      addTagToNote(noteId, tagId);
    }
    setLocalTags(updatedTags);
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
        position="relative"
      >
        {note.status && (
          <VStack
            position="absolute"
            top={"50%"}
            left={0}
            right={0}
            bg="brand.2"
            color="brand.4"
            p={2}
            textAlign="center"
            zIndex={1}
          >
            This note is archived. Unarchive to make changes, or delete it.
            <Flex gap={2}> 
              <BrandButton onClick={handleUnarchive} variant="secondary"><FaBox />Unarchive</BrandButton>
              <BrandButton onClick={handleDelete} variant="danger"><FaTrash />Delete</BrandButton>
            </Flex>
          </VStack>
        )}
        <Box as="form" width="100%" borderBottom="2px solid" borderColor="brand.2" mt={note.status ? "40px" : 0}>
          <Flex alignItems="center">
            <TitleInput 
              placeholder="Note title" 
              value={title} 
              onChange={handleTitleChange} 
              disabled={note.status}
              style={{ opacity: note.status ? 0.7 : 1 }}
            />
            <Menu.Root >
              <Menu.Trigger asChild>
                <IconActionButton
                  visibility={note.status ? "hidden" : "visible"}
                  aria-label="More options"
                  variant="menu"
                  icon={<FaEllipsisV />}
                />
              </Menu.Trigger>
              <Portal container={contentDialogRef ?? undefined}>
                <Menu.Positioner>
                  <Menu.Content>
                    <TagMenu
                      selectedTagIds={localTags}
                      onTagToggle={handleTagToggle}
                      contentDialogRef={contentDialogRef}
                    />
                    {note.status ? (
                      <Menu.Item onClick={handleUnarchive} value="unarchive">
                        <FaBox style={{ marginRight: "8px" }} />
                        Unarchive Note
                      </Menu.Item>
                    ) : (
                      <Menu.Item onClick={handleArchive} value="archive">
                        <FaArchive style={{ marginRight: "8px" }} />
                        Archive Note
                      </Menu.Item>
                    )}
                    <Menu.Item onClick={handleDelete} value="delete" disabled={!note.status}>
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
              <IconActionButton
                aria-label="Close"
                variant="close"
                onClick={onComplete}
                icon={<FaTimes />}
              />
            )}
          </Flex>
        </Box>

        {localTags.length > 0 && (
          <Box p={2} borderBottom="1px solid" borderColor="brand.2">
            <Flex align="center" justify="space-between">
              <TagBadges tagIds={localTags} onRemove={handleTagToggle} />
            </Flex>
          </Box>
        )}

        <Box flex="1" overflow="auto" borderBottom="2px solid" borderColor="brand.2" style={{ opacity: note.status ? 0.7 : 1 }}>
          <Editor 
            markdown={content} 
            onChange={handleContentChange} 
            editorRef={ref} 
            readOnly={note.status}
            showToolbar={showToolbar}
          />
        </Box>
      </Flex>

      {showChangelog && (
        <NoteChangelog
          isOpen={showChangelog}
          onClose={() => setShowChangelog(false)}
          noteId={noteId}
          originalContent={content}
          originalTitle={title}
        />
      )}
    </>
  );
};

export default NoteEdit;
