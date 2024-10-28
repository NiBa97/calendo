import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
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
        take:100
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
      return ctx.db.task.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});