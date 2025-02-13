import { TaskRecord } from "./pocketbase-types";

export interface Task {
    id: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    status: boolean;
    name: string;
    description: string;
  }

  export function convertTaskRecordToTask(record: TaskRecord): Task {
    if (!record.startDate) {
      throw new Error('TaskRecord must have a startDate');
    }
    if (!record.endDate) {
      throw new Error('TaskRecord must have an endDate');
    }
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
      startDate: new Date(record.startDate),
      endDate: new Date(record.endDate),
      isAllDay: record.isAllDay,
      status: record.status,
      name: record.name,
      description: record.description ? record.description : ""
    };
  }
  