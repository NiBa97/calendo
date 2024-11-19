// src/contexts/note-context.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Note, type Tag } from "@prisma/client";
import { api } from "~/trpc/react";
import { useToast } from "@chakra-ui/react";

export interface NoteWithTags extends Note {
  tags: Tag[];
}

interface NoteContextType {
  notes: NoteWithTags[];
  filteredNotes: NoteWithTags[];
  tags: Tag[];
  searchTerm: string;
  selectedTags: string[];
  selectedNote: NoteWithTags | null;
  createNote: (noteData: Partial<NoteWithTags>) => Promise<NoteWithTags>;
  updateNote: (noteId: string, updatedData: Partial<NoteWithTags>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  restoreNote: (noteId: string, historyId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedNote: (note: NoteWithTags | null) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<NoteWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteWithTags | null>(null);

  const toast = useToast();

  const { data: fetchedNotes } = api.note.getAllForUser.useQuery();
  const { data: fetchedTags } = api.note.getAllTags.useQuery();
  const { mutateAsync: createMutation } = api.note.create.useMutation();
  const { mutateAsync: updateMutation } = api.note.update.useMutation();
  const { mutateAsync: deleteMutation } = api.note.delete.useMutation();
  const { mutateAsync: restoreMutation } = api.note.restore.useMutation();

  useEffect(() => {
    if (fetchedNotes) setNotes(fetchedNotes);
  }, [fetchedNotes]);

  useEffect(() => {
    if (fetchedTags) setTags(fetchedTags);
  }, [fetchedTags]);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === "" ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => note.tags.some((noteTag) => noteTag.name === tag));

    return matchesSearch && matchesTags;
  });

  const createNote = async (noteData: Partial<NoteWithTags>): Promise<NoteWithTags> => {
    const dataWithDefaults = noteData as {
      title: string;
      content?: string;
      tags?: string[];
    };

    const newNote = await createMutation(dataWithDefaults);
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    return newNote;
  };

  const updateNote = async (noteId: string, updatedData: Partial<NoteWithTags>) => {
    const dataWithDefaults = updatedData as {
      title?: string;
      content?: string;
      tags?: string[];
    };

    try {
      const updatedNote = await updateMutation({ id: noteId, ...dataWithDefaults });
      setNotes((prevNotes) => prevNotes.map((note) => (note.id === noteId ? updatedNote : note)));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating the note.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    await deleteMutation({ id: noteId });
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  const restoreNote = async (noteId: string, historyId: string) => {
    try {
      const restoredNote = await restoreMutation({ noteId, historyId });
      setNotes((prevNotes) => prevNotes.map((note) => (note.id === noteId ? restoredNote : note)));
      toast({
        title: "Note restored",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while restoring the note.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        filteredNotes,
        tags,
        searchTerm,
        selectedTags,
        selectedNote,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        setSearchTerm,
        setSelectedTags,
        setSelectedNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NoteProvider");
  }
  return context;
};
