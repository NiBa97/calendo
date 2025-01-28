import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const pomodoroRouter = createTRPCRouter({
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.pomodoro.findFirst({
      where: {
        userId: ctx.session.user.id,
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });
  }),

  start: protectedProcedure
    .input(z.object({ duration: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // First cancel any active pomodoros
      await ctx.db.pomodoro.deleteMany({
        where: {
          userId: ctx.session.user.id,
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      return ctx.db.pomodoro.create({
        data: {
          duration: input.duration,
          userId: ctx.session.user.id,
        },
      });
    }),

  stop: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      duration: z.number().min(1) // Actual completed duration
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("Stopping pomodoro", input);
      // Update the pomodoro with actual duration before deleting
      return ctx.db.pomodoro.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          duration: input.duration,
        },
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pomodoro.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
}); 