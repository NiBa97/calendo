import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
const taskInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isAllDay: z.boolean().optional(),
  status: z.boolean().optional(),
  // groupId: z.string().cuid().optional(),
});
// const tasks: Partial<{
//   id: string;
//   startDate: Date | null;
//   endDate: Date | null;
//   isAllDay: boolean;
//   status: boolean;
//   name: string;
//   description: string | null;
//   groupId: string | null;
//   userId: string;
// }>[]
export const taskRouter = createTRPCRouter({
  deleteDuplicates: protectedProcedure
  .mutation(async ({ ctx }) => {
    // 1. Get all tasks for the user
    const tasks = await ctx.db.task.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { startDate: 'asc' }, // Keep oldest tasks
    });

    // 2. Find duplicates
    const seen = new Map();
    const duplicates = new Set();

    tasks.forEach(task => {
      const key = JSON.stringify({
        name: task.name,
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate
      });

      if (seen.has(key)) {
        duplicates.add(task.id);
      } else {
        seen.set(key, task.id);
      }
    });

    if (duplicates.size === 0) {
      return { deletedCount: 0 };
    }
    // 3. Convert duplicates to array for processing
    const duplicateIds = Array.from(duplicates);
    let deletedCount = 0;
    const BATCH_SIZE = 1000; // Process 1000 items at a time

    // 4. Process in batches
    for (let i = 0; i < duplicateIds.length; i += BATCH_SIZE) {
      const batch = duplicateIds.slice(i, i + BATCH_SIZE);
      
      // Use transaction to ensure consistency
      await ctx.db.$transaction(async (tx) => {
        // Delete histories first
        await tx.taskHistory.deleteMany({
          where: {
            taskId: { in: batch as string[] },
            userId: ctx.session.user.id
          }
        });

        // Then delete tasks
        const result = await tx.task.deleteMany({
          where: {
            id: { in: batch as string[] },
            userId: ctx.session.user.id
          }
        });

        deletedCount += result.count;
      });
    }


    return { deletedCount: duplicates.size };
  }),
    create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      isAllDay: z.boolean().optional(),
      status: z.boolean().optional(),
      groupId: z.string().cuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const newTask = await ctx.db.task.create({
        data: {
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          isAllDay: input.isAllDay ?? false,
          status: input.status ?? false,
          groupId: input.groupId,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          isAllDay: true,
          status: true,
          groupId: true,
          userId: true,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {id : taskId, ...newTaskData} = newTask;
      await ctx.db.taskHistory.create({
        data: {
          ...newTaskData,
          taskId: taskId,
      }})
      return newTask;
    }),

    createBulk: protectedProcedure
    .input(z.object({
      tasks: z.array(taskInputSchema)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const tasks = ctx.db.task.createManyAndReturn({
          data: input.tasks.map((taskData) => ({
            name: taskData.name,
            description: taskData.description,
            startDate: taskData.startDate,
            endDate: taskData.endDate,
            isAllDay: taskData.isAllDay ?? false,
            status: taskData.status ?? false,
            userId: ctx.session.user.id,
          })),
        });
        return tasks;
        
      } catch (error) {
        console.log(error)
        // If the transaction fails entirely
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tasks',
          cause: error,
        });
      }

    }),
getHistoric: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.taskHistory.findMany({
        where: { taskId: input.id, userId:ctx.session.user.id },
        orderBy: { changedAt: "desc" },
      });
    }),
getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.task.findMany({
        where: { userId: ctx.session.user.id},
        take:10000
      });
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findUnique({
        where: { id: input.id, userId: ctx.session.user.id},
        include: { Group: true, User: true },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.boolean().optional(),
      groupId: z.string().cuid().nullable().optional(),
      startDate: z.date().nullable().optional(),
      endDate: z.date().nullable().optional(),
      isAllDay: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const task = await ctx.db.task.update({
        where: { id: id, userId: ctx.session.user.id},
        data,
      });
      const {id : taskId, ...taskData} = task;
      await ctx.db.taskHistory.create({
        data: {
          ...taskData,
          taskId: taskId,
        },
      });
      return task;
    }),
  restore: protectedProcedure
    .input(z.object({
      originalID: z.string().cuid(),
      historyTimestamp: z.date(),
      name: z.string().min(1),
      description: z.string().optional(),
      startDate: z.date().nullable().optional(),
      endDate: z.date().nullable().optional(),
      isAllDay: z.boolean().optional(),
      status: z.boolean().optional(),
      groupId: z.string().cuid().nullable().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { originalID, historyTimestamp, ...data } = input;
      const task = await ctx.db.task.update({
        where: { id: originalID, userId: ctx.session.user.id },
        data,
      });
      await ctx.db.taskHistory.deleteMany({
        where: { taskId: originalID, changedAt: { gt: historyTimestamp } },
      });
      return task;
    }),
  updateDates: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      startDate: z.date(),
      endDate: z.date(),
      isAllDay: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.task.update({
        where: { id: id, userId:ctx.session.user.id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.taskHistory.deleteMany({
        where: { taskId: input.id, userId: ctx.session.user.id },
      });
      return ctx.db.task.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});