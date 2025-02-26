// src/contexts/note-context.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { NoteRecord } from "../pocketbase-types";
import { getPb } from "../pocketbaseUtils";
import { Note, convertNoteRecordToNote } from "../types";
import { useOperationStatus } from "./operation-status-context";

interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  searchTerm: string;
  selectedTags: string[];
  selectedNote: Note | null;
  createNote: (noteData: Partial<Note>) => Promise<Note>;
  updateNote: (noteId: string, updatedData: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  restoreNote: (noteId: string, historyId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedNote: (note: Note | null) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pb = getPb();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { setStatus } = useOperationStatus();

  useEffect(() => {
    setStatus("loading");
    pb.collection("note")
      .getFullList()
      .then((records: NoteRecord[]) => {
        setNotes(records.map(convertNoteRecordToNote));
        setStatus("idle");
      })
      .catch((error) => {
        console.error("Failed to load notes:", error);
        setStatus("error");
      });
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === "" ||
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    // const matchesTags =
    //   selectedTags.length === 0 || selectedTags.every((tag) => note.tags.some((noteTag) => noteTag.name === tag));

    return matchesSearch; //&& matchesTags;
  });
  const createNote = async (noteData: Partial<Note>) => {
    try {
      setStatus("loading");
      const data = {
        title: noteData.title || "",
        content: noteData.content || "",
        // user: pb.authStore.model?.id,
      };

      const record = await pb.collection("note").create(data);
      const newNote = convertNoteRecordToNote(record);
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      setStatus("idle");
      return newNote;
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const updateNote = async (noteId: string, updatedData: Partial<Note>) => {
    try {
      setStatus("loading");
      const data = {
        title: updatedData.title,
        content: updatedData.content,
        user: pb.authStore.model?.id,
      };

      const record = await pb.collection("note").update(noteId, data);
      const updatedNote = convertNoteRecordToNote(record);
      setNotes((prevNotes) => prevNotes.map((note) => (note.id === noteId ? updatedNote : note)));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setStatus("loading");
      await pb.collection("note").delete(noteId);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const restoreNote = async (noteId: string, historyId: string) => {
    try {
      setStatus("loading");
      console.log("restoreNote", noteId, historyId);
      alert("Restore functionality not yet implemented with PocketBase");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        filteredNotes,
        // tags,
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
