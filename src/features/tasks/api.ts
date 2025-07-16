import moment from "moment";
import { TaskRecord } from "../../pocketbase-types";
import { getPb } from "../../pocketbaseUtils";
import { TaskFilter } from "./task-filter";
import { convertTaskRecordToTask, Task } from "./type";

function getFilterString(filter: TaskFilter, start_date: Date | undefined = undefined, end_date: Date | undefined = undefined): string {
  const filterParts = [];
  if (filter.search !== "") {
    filterParts.push(`(title ~ '${filter.search}' || description ~ '${filter.search}')`);
  }
  if (filter.status !== undefined) {
    filterParts.push(`status=${filter.status}`);
  }
  if (filter.tags.length > 0) {
    filterParts.push(`tags.id~'${filter.tags.join(",")}'`);
  }
  if (start_date) {
    filterParts.push(`startDate >= '${moment(start_date).startOf('day').toISOString()}'`);
  }
  if (end_date) {
    filterParts.push(`startDate <= '${moment(end_date).endOf('day').toISOString()}'`);
  }
  console.log("Filter parts:", filterParts, filterParts.length);
  if (filterParts.length === 0) {
    return ""; // No filter applied
  } else{
    return filterParts.join(" && ");
  }
}

export async function getTasks(filter: TaskFilter, start_date: Date | undefined, end_date: Date | undefined): Promise<Task[]> {
  const pb = getPb();
  const filterString = getFilterString(filter, start_date, end_date);


  const sortString = (filter.sortDirection === "asc" ? "" : "-") + filter.sortField;
  return pb.collection("task").getList(filter.page, 25, { sort: sortString, filter: filterString,
     skipTotal: true , expand: "tags" }).then((res) => {
       return res.items.map(convertTaskRecordToTask);
     });
}

export async function getTaskCount(filter: TaskFilter): Promise<number> {
  const pb = getPb();
  return pb.collection("task").getList(1, 1, { filter: getFilterString(filter), skipTotal: false , requestKey: null}).then((res) => res.totalItems);
}

export async function update(id: string, taskData: Partial<Task>): Promise<TaskRecord> {
  const pb = getPb();
  return pb.collection("task").update(id, taskData);
}