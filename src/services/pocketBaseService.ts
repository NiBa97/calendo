import { pb } from "../pocketbaseUtils"; // Use named export
// import filter
import { Filter } from "../lib/filters"
import { convertNoteRecordToNote, convertTaskRecordToTask, Note, Task } from "../types";
import { ListResult, RecordModel } from "pocketbase"; // Import PocketBase types

export const getTasks = async (filter: Filter): Promise<Task[]> => {
    const records = await pb.collection("task").getList(filter.pageNumber, filter.itemsPerPage, {
        filter: filter.toPocketbaseFilter(),
        sort: filter.toPocketbaseSort(),
    });
    return records.items.map((record: RecordModel) => convertTaskRecordToTask(record));
};

export const getNotes = async (filter: Filter): Promise<Note[]> => {
    const records: ListResult<RecordModel> = await pb.collection("note").getList(filter.pageNumber, filter.itemsPerPage, {
        filter: filter.toPocketbaseFilter(),
        sort: filter.toPocketbaseSort(),
    });
    // convert to note
    const notes: Note[] = records.items.map((record: RecordModel) => convertNoteRecordToNote(record));
    return notes;
};
