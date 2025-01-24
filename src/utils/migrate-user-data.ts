import { PrismaClient } from "@prisma/client";
import type { Task, Note, Group, Tag, TaskHistory, NoteHistory, Attachment } from "@prisma/client";

const prisma = new PrismaClient();

// Define interfaces for objects with history
interface TaskWithHistory extends Task {
  TaskHistory: TaskHistory[];
}

interface NoteWithHistory extends Note {
  NoteHistory: NoteHistory[];
  tags: Tag[];
}

// Helper function to log with timestamp
function logWithTime(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function getDataCounts(userId: string) {
  const counts = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.taskHistory.count({ where: { userId } }),
    prisma.note.count({ where: { userId } }),
    prisma.noteHistory.count({ where: { userId } }),
    prisma.attachment.count({ where: { userId } }),
    prisma.group.count({ where: { userId } }),
    prisma.tag.count({ where: { userId } })
  ]);

  return {
    tasks: counts[0],
    taskHistory: counts[1],
    notes: counts[2],
    noteHistory: counts[3],
    attachments: counts[4],
    groups: counts[5],
    tags: counts[6]
  };
}

async function migrateGroups(oldUserId: string, newUserId: string) {
  logWithTime("Migrating groups...");
  const groups = await prisma.group.findMany({
    where: { userId: oldUserId }
  });
  
  const groupMap = new Map<string, string>();
  
  for (const [index, group] of groups.entries()) {
    logWithTime(`Migrating group ${index + 1}/${groups.length}`);
    const newGroup = await prisma.group.create({
      data: {
        name: group.name,
        color: group.color,
        userId: newUserId
      }
    });
    groupMap.set(group.id, newGroup.id);
  }

  return groupMap;
}

async function migrateTask(task: TaskWithHistory, newUserId: string, groupMap: Map<string, string>) {
  const groupId = task.groupId ? groupMap.get(task.groupId) : null;
  
  // Create new task
  const newTask = await prisma.task.create({
    data: {
      name: task.name,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
      isAllDay: task.isAllDay,
      status: task.status,
      groupId: groupId ?? undefined,
      userId: newUserId,
    }
  });

  // Create task history entries
  for (const history of task.TaskHistory) {
    await prisma.taskHistory.create({
      data: {
        taskId: newTask.id,
        name: history.name,
        description: history.description,
        startDate: history.startDate,
        endDate: history.endDate,
        isAllDay: history.isAllDay,
        status: history.status,
        groupId: history.groupId ? groupMap.get(history.groupId) : null,
        userId: newUserId,
        changedAt: history.changedAt,
      }
    });
  }

  return newTask;
}

async function migrateTasks(oldUserId: string, newUserId: string, groupMap: Map<string, string>) {
  logWithTime("Migrating tasks and their history...");
  const tasks = await prisma.task.findMany({
    where: { userId: oldUserId },
    include: {
      TaskHistory: true,
    }
  }) as TaskWithHistory[];

  const taskMap = new Map<string, string>();

  for (const [index, task] of tasks.entries()) {
    try {
      logWithTime(`Migrating task ${index + 1}/${tasks.length}: ${task.name}`);
      const newTask = await migrateTask(task, newUserId, groupMap);
      taskMap.set(task.id, newTask.id);
    } catch (error) {
      console.error(`Error migrating task ${task.id}:`, error);
    }
  }

  return taskMap;
}

async function migrateNote(note: NoteWithHistory, newUserId: string) {
  // Create new note
  const newNote = await prisma.note.create({
    data: {
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      userId: newUserId,
    }
  });

  // Create note history entries
  for (const history of note.NoteHistory) {
    await prisma.noteHistory.create({
      data: {
        noteId: newNote.id,
        title: history.title,
        content: history.content,
        userId: newUserId,
        changedAt: history.changedAt,
      }
    });
  }

  // Handle tags
  for (const tag of note.tags) {
    // Create or get existing tag
    const newTag = await prisma.tag.upsert({
      where: {
        userId_name: {
          userId: newUserId,
          name: tag.name,
        }
      },
      create: {
        name: tag.name,
        userId: newUserId,
      },
      update: {}
    });

    // Connect tag to note
    await prisma.note.update({
      where: { id: newNote.id },
      data: {
        tags: {
          connect: { id: newTag.id }
        }
      }
    });
  }

  return newNote;
}

async function migrateNotes(oldUserId: string, newUserId: string) {
  logWithTime("Migrating notes and their history...");
  const notes = await prisma.note.findMany({
    where: { userId: oldUserId },
    include: {
      NoteHistory: true,
      tags: true,
    }
  }) as NoteWithHistory[];

  const noteMap = new Map<string, string>();

  for (const [index, note] of notes.entries()) {
    try {
      logWithTime(`Migrating note ${index + 1}/${notes.length}: ${note.title}`);
      const newNote = await migrateNote(note, newUserId);
      noteMap.set(note.id, newNote.id);
    } catch (error) {
      console.error(`Error migrating note ${note.id}:`, error);
    }
  }

  return noteMap;
}

async function migrateAttachments(oldUserId: string, newUserId: string, taskMap: Map<string, string>, noteMap: Map<string, string>) {
  logWithTime("Migrating attachments...");
  const attachments = await prisma.attachment.findMany({
    where: { userId: oldUserId }
  });

  for (const [index, attachment] of attachments.entries()) {
    try {
      logWithTime(`Migrating attachment ${index + 1}/${attachments.length}: ${attachment.fileName}`);
      
      // Map the task or note ID if they exist
      const taskId = attachment.taskId ? taskMap.get(attachment.taskId) : null;
      const noteId = attachment.noteId ? noteMap.get(attachment.noteId) : null;

      await prisma.attachment.create({
        data: {
          fileName: attachment.fileName,
          fileKey: attachment.fileKey,
          uploadedAt: attachment.uploadedAt,
          parentType: attachment.parentType,
          taskId: taskId ?? undefined,
          noteId: noteId ?? undefined,
          userId: newUserId,
        }
      });
    } catch (error) {
      console.error(`Error migrating attachment ${attachment.id}:`, error);
    }
  }
}
async function migrateUserData(oldUserId: string, newUserId: string) {
  try {
    // First verify users exist
    const oldUser = await prisma.user.findUnique({ where: { id: oldUserId } });
    if (!oldUser) {
      throw new Error(`Old user (${oldUserId}) not found!`);
    }

    // Get initial counts
    logWithTime("Getting initial data counts...");
    const beforeCounts = await getDataCounts(oldUserId);
    console.log("Data to migrate:", beforeCounts);

    // Migrate each type of data
    const groupMap = await migrateGroups(oldUserId, newUserId);
    const taskMap = await migrateTasks(oldUserId, newUserId, groupMap);
    const noteMap = await migrateNotes(oldUserId, newUserId);
    await migrateAttachments(oldUserId, newUserId, taskMap, noteMap);

    // Get final counts
    logWithTime("Getting final data counts...");
    const afterCounts = await getDataCounts(newUserId);
    
    // Print migration summary
    console.log("\nMigration Summary:");
    console.log("------------------");
    console.log("Original Data:", beforeCounts);
    console.log("Migrated Data:", afterCounts);
    
    // Verify counts match
    const countMatches = Object.entries(beforeCounts).every(
      ([key, count]) => count === afterCounts[key as keyof typeof afterCounts]
    );
    
    if (countMatches) {
      logWithTime("✅ Migration completed successfully! All data counts match.");
    } else {
      logWithTime("⚠️ Migration completed but data counts don't match. Please verify the data manually.");
    }

  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function findUsers() {
  try {
    logWithTime("Finding all users...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            Task: true,
            Note: true,
            Attachment: true,
            Group: true,
            Tag: true
          }
        }
      }
    });

    console.log("\nFound users:");
    users.forEach(user => {
      console.log(`
ID: ${user.id}
Email: ${user.email ?? 'No email'}
Name: ${user.name ?? 'No name'}
Data Counts:
- Tasks: ${user._count.Task}
- Notes: ${user._count.Note}
- Attachments: ${user._count.Attachment}
- Groups: ${user._count.Group}
- Tags: ${user._count.Tag}
-------------------`);
    });

  } catch (error) {
    console.error("Error finding users:", error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // If no arguments provided, show all users
    if (process.argv.length < 4) {
      console.log("Usage: npm run migrate-user [old-user-id] [new-user-id]");
      console.log("\nAvailable users:");
      await findUsers();
      process.exit(1);
    }

    const oldUserId = process.argv[2];
    const newUserId = process.argv[3];

    logWithTime(`Starting migration from user ${oldUserId} to ${newUserId}`);
    await migrateUserData(oldUserId!, newUserId!);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the script
void main();