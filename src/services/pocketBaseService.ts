import { pb } from "../pocketbaseUtils"; // Use named export
// import filter
import { Filter } from "../lib/filters"
import { convertNoteRecordToNote, convertTagRecordToTag, convertTaskRecordToTask, Note, Tag, Task, TaskOrNote } from "../types";
import { ListResult, RecordModel } from "pocketbase"; // Import PocketBase types
import { TaskandnotesRecord } from "../pocketbase-types";

export const getTasks = async (filter: Filter): Promise<Task[]> => {
    const records = await pb.collection("task").getList(filter.pageNumber, filter.itemsPerPage, {
        filter: filter.toPocketbaseFilter(),
        sort: filter.toPocketbaseSort(),
        requestKey: "tasks",
    });
    return records.items.map((record: RecordModel) => convertTaskRecordToTask(record));
};

export const getNotes = async (filter: Filter): Promise<Note[]> => {
    const records: ListResult<RecordModel> = await pb.collection("note").getList(filter.pageNumber, filter.itemsPerPage, {
        filter: filter.toPocketbaseFilter(),
        sort: filter.toPocketbaseSort(),
        requestKey: "notes",
    });
    // convert to note
    const notes: Note[] = records.items.map((record: RecordModel) => convertNoteRecordToNote(record));
    return notes;
};

export const getTaskAndNotes = async (filter: Filter): Promise<TaskOrNote[]> => {
    console.log("filter", filter.toPocketbaseFilter())
    const records: ListResult<TaskandnotesRecord> = await pb.collection("taskandnotes").getList(filter.pageNumber, filter.itemsPerPage, {
        filter: filter.toPocketbaseFilter(),
        sort: filter.toPocketbaseSort(),
        requestKey: "taskandnotes",
    });
    // case to TaskOrNote
    const taskOrNotes: TaskOrNote[] = records.items.map((record: TaskandnotesRecord) => {
        return {
            type: record.type as "task" | "note",
            id: record.id,
            title: record.title as string,
            content: record.content as string,
            user: record.user as string[],
            tags: record.tags as string[],
            status: record.status as boolean,
            created: new Date(record.created as string),
            updated: new Date(record.updated as string),
        }
    });
    return taskOrNotes;
}

export const getCollectionCount = async (collection: string, filter: Filter): Promise<number> => {
    const records = await pb.collection(collection).getList(1, 1, {
        filter: filter.toPocketbaseFilter(),
        requestKey: null,
    });
    return records.totalItems;
};

export const getTags = async (): Promise<Tag[]> => {
    const records = await pb.collection("tag").getFullList({
        requestKey: null,
    });
    return records.map((record: RecordModel) => convertTagRecordToTag(record));
};