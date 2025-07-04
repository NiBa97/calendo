import { TaskRecord } from "../../../pocketbase-types";
import { RecordModel } from "pocketbase";

// Type that encompasses both specific record types and generic RecordModel
type TaskRecordOrModel = TaskRecord | RecordModel;

export interface Task {
  id: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  created: Date;
  isAllDay: boolean;
  status: boolean;
  title: string;
  description: string;
  user: string[];
  tags: string[];
}

export function convertTaskRecordToTask(record: TaskRecord): Task;
export function convertTaskRecordToTask(record: RecordModel): Task;
export function convertTaskRecordToTask(record: TaskRecordOrModel): Task {
  // Make sure we have the required fields
  if (!record.title) {
    throw new Error('TaskRecord must have a title');
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
    title: record.title,
    description: record.description ? record.description : "",
    user: record.user ?? [],
    tags: record.tags ?? [],
    created: record.created ? new Date(record.created) : new Date(),
  };
}