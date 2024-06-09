import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const groupRouter = createTRPCRouter({
    create: protectedProcedure
    .input(z.object({ name: z.string().min(1), color: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      return ctx.db.group.create({
        data: {
          name: input.name,
          color: input.color,
          userId: ctx.session.user.id,
        },
      });
    }),

  read: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.group.findUnique({
        where: { id: input.id, userId:ctx.session.user.id },
        select: {id:true, name:true, color:true}
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().cuid(), name: z.string().min(1), color: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, name, color } = input;
      return ctx.db.group.update({
        where: { id:id, userId:ctx.session.user.id },
        data: {
          name: name ?? undefined,
          color: color ?? undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.group.delete({
        where: { id: input.id,  userId:ctx.session.user.id},
      });
    }),
});