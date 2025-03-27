import { TaskRecord, NoteRecord, TagRecord } from "./pocketbase-types";
import { RecordModel } from "pocketbase";

// Type that encompasses both specific record types and generic RecordModel
type TaskRecordOrModel = TaskRecord | RecordModel;
type NoteRecordOrModel = NoteRecord | RecordModel;
type TagRecordOrModel = TagRecord | RecordModel;

export interface Task {
    id: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    isAllDay: boolean;
    status: boolean;
    name: string;
    description: string;
    user: string[];
    tags: string[];
}

export function convertTaskRecordToTask(record: TaskRecord): Task;
export function convertTaskRecordToTask(record: RecordModel): Task;
export function convertTaskRecordToTask(record: TaskRecordOrModel): Task {
    // Make sure we have the required fields
    if (!record.name) {
        throw new Error('TaskRecord must have a name');
    }
    if (record.isAllDay === undefined) {
        throw new Error('TaskRecord must have an isAllDay property');
    }
    if (record.status === undefined) {
        throw new Error('TaskRecord must have a status property');
    }
    
    return {
        id: record.id,
        startDate: record.startDate ? new Date(record.startDate) : undefined,
        endDate: record.endDate ? new Date(record.endDate) : undefined,
        isAllDay: record.isAllDay,
        status: record.status,
        name: record.name,
        description: record.description ? record.description : "",
        user: record.user ?? [],
        tags: record.tags ?? [],
    };
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  updated: Date | undefined;
  created: Date;
  user: string[];
  tags: string[];
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
 
  