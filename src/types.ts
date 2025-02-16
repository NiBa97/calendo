import { TaskRecord } from "./pocketbase-types";

export interface Task {
    id: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    isAllDay: boolean;
    status: boolean;
    name: string;
    description: string;
  }

  export function convertTaskRecordToTask(record: TaskRecord): Task {

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
      description: record.description ? record.description : ""
    };
  }
  