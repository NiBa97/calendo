import { NoteRecord, TagRecord } from "./pocketbase-types";
import { RecordModel } from "pocketbase";

// Type that encompasses both specific record types and generic RecordModel
type NoteRecordOrModel = NoteRecord | RecordModel;
type TagRecordOrModel = TagRecord | RecordModel;

export interface Note {
  id: string;
  title: string;
  content?: string;
  updated: Date | undefined;
  created: Date;
  user: string[];
  tags: string[];
  status: boolean;
}

export function convertNoteRecordToNote(record: NoteRecord): Note;
export function convertNoteRecordToNote(record: RecordModel): Note;
export function convertNoteRecordToNote(record: NoteRecordOrModel): Note {
  if (!record.title) {
    throw new Error('NoteRecord must have a title');
  }

  return {
    id: record.id,
    title: record.title,
    content: record.content || "",
    user: record.user ?? [],
    updated: record.updated ? new Date(record.updated) : undefined,
    created: new Date(record.created!),
    tags: record.tags ?? [],
    status: record.status ?? false,
  };
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user: string[];
}

export function convertTagRecordToTag(record: TagRecord): Tag;
export function convertTagRecordToTag(record: RecordModel): Tag;
export function convertTagRecordToTag(record: TagRecordOrModel): Tag {
  return {
    id: record.id,
    name: record.name || "",
    color: record.color || "#808080",
    user: record.user ?? [],
  };
}

