import { getPb } from "../../../pocketbaseUtils";
import { Task, convertTaskRecordToTask } from "../types/task.types";

export interface TaskAPI {
  createTask(data: Partial<Task>): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  loadTasks(): Promise<Task[]>;
  addTagToTask(taskId: string, tagId: string): Promise<Task>;
  removeTagFromTask(taskId: string, tagId: string): Promise<Task>;
}

export const taskAPI: TaskAPI = {
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const pb = getPb();
    const currentTime = new Date();
    const isInPast =
      taskData.startDate && taskData.endDate && taskData.startDate < currentTime && taskData.endDate < currentTime;

    const data = {
      startDate: taskData.startDate?.toISOString(),
      endDate: taskData.endDate?.toISOString(),
      isAllDay: taskData.isAllDay ?? false,
      status: isInPast ? true : taskData.status ?? false,
      title: taskData.title,
      description: taskData.description,
      tags: taskData.tags || [],
      user: [pb.authStore.record?.id],
    };

    const record = await pb.collection("task").create(data);
    return convertTaskRecordToTask(record);
  },

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
    const pb = getPb();
    
    // If startDate is being updated and is after endDate, adjust endDate accordingly
    if (taskData.startDate && taskData.endDate && taskData.startDate > taskData.endDate) {
      taskData.endDate = new Date(taskData.startDate.getTime());
    }

    // Convert dates to ISO strings for the API
    const updateData = {
      ...taskData,
      startDate: taskData.startDate?.toISOString(),
      endDate: taskData.endDate?.toISOString(),
    };

    const record = await pb.collection("task").update(taskId, updateData);
    return convertTaskRecordToTask(record);
  },

  async deleteTask(taskId: string): Promise<void> {
    const pb = getPb();
    await pb.collection("task").delete(taskId);
  },

  async loadTasks(): Promise<Task[]> {
    const pb = getPb();
    const records = await pb.collection("task").getFullList();
    return records.map(convertTaskRecordToTask);
  },

  async addTagToTask(taskId: string, tagId: string): Promise<Task> {
    const pb = getPb();
    const record = await pb.collection("task").getOne(taskId);
    const task = convertTaskRecordToTask(record);
    
    const updatedTags = [...(task.tags || [])];
    if (!updatedTags.includes(tagId)) {
      updatedTags.push(tagId);
    }

    const updatedRecord = await pb.collection("task").update(taskId, { tags: updatedTags });
    return convertTaskRecordToTask(updatedRecord);
  },

  async removeTagFromTask(taskId: string, tagId: string): Promise<Task> {
    const pb = getPb();
    const record = await pb.collection("task").getOne(taskId);
    const task = convertTaskRecordToTask(record);
    
    const updatedTags = (task.tags || []).filter((id) => id !== tagId);

    const updatedRecord = await pb.collection("task").update(taskId, { tags: updatedTags });
    return convertTaskRecordToTask(updatedRecord);
  },
};