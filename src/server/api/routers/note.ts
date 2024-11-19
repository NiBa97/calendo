import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const noteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create tags if they don't exist
      const tags = input.tags ? await Promise.all(
        input.tags.map(tagName =>
          ctx.db.tag.upsert({
            where: {
              userId_name: {
                userId: ctx.session.user.id,
                name: tagName,
              },
            },
            create: {
              name: tagName,
              userId: ctx.session.user.id,
            },
            update: {},
          })
        )
      ) : [];

      // Create note with tags
      const note = await ctx.db.note.create({
        data: {
          title: input.title,
          content: input.content,
          userId: ctx.session.user.id,
          tags: {
            connect: tags.map(tag => ({ id: tag.id })),
          },
        },
        include: {
          tags: true,
        },
      });

      // Create initial history entry
      await ctx.db.noteHistory.create({
        data: {
          title: note.title,
          content: note.content,
          noteId: note.id,
          userId: ctx.session.user.id,
        },
      });

      return note;
    }),

  getAllForUser: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.note.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          tags: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const note = await ctx.db.note.findUnique({
        where: { 
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          tags: true,
        },
      });

      if (!note) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found',
        });
      }

      return note;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      title: z.string().optional(),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, tags: newTags, ...updateData } = input;

      // Handle tags if provided
      let tagConnect;
      if (newTags) {
        const tags = await Promise.all(
          newTags.map(tagName =>
            ctx.db.tag.upsert({
              where: {
                userId_name: {
                  userId: ctx.session.user.id,
                  name: tagName,
                },
              },
              create: {
                name: tagName,
                userId: ctx.session.user.id,
              },
              update: {},
            })
          )
        );
        tagConnect = {
          set: [],
          connect: tags.map(tag => ({ id: tag.id })),
        };
      }

      const updatedNote = await ctx.db.note.update({
        where: { 
          id,
          userId: ctx.session.user.id,
        },
        data: {
          ...updateData,
          tags: tagConnect,
        },
        include: {
          tags: true,
        },
      });

      // Create history entry
      await ctx.db.noteHistory.create({
        data: {
          title: updatedNote.title,
          content: updatedNote.content,
          noteId: updatedNote.id,
          userId: ctx.session.user.id,
        },
      });

      return updatedNote;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.note.delete({
        where: { 
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  getHistory: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.noteHistory.findMany({
        where: { 
          noteId: input.id,
          userId: ctx.session.user.id,
        },
        orderBy: { changedAt: 'desc' },
      });
    }),

  restore: protectedProcedure
    .input(z.object({
      noteId: z.string().cuid(),
      historyId: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const historyEntry = await ctx.db.noteHistory.findUnique({
        where: { 
          id: input.historyId,
          userId: ctx.session.user.id,
        },
      });

      if (!historyEntry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'History entry not found',
        });
      }

      const updatedNote = await ctx.db.note.update({
        where: { 
          id: input.noteId,
          userId: ctx.session.user.id,
        },
        data: {
          title: historyEntry.title,
          content: historyEntry.content,
        },
        include: {
          tags: true,
        },
      });

      // Delete newer history entries
      await ctx.db.noteHistory.deleteMany({
        where: {
          noteId: input.noteId,
          changedAt: {
            gt: historyEntry.changedAt,
          },
        },
      });

      return updatedNote;
    }),

  getAllTags: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.tag.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          _count: {
            select: { notes: true },
          },
        },
      });
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      tags: z.array(z.string()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.note.findMany({
        where: {
          userId: ctx.session.user.id,
          AND: [
            {
              OR: [
                { title: { contains: input.query, mode: 'insensitive' } },
                { content: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            input.tags && input.tags.length > 0
              ? {
                  tags: {
                    some: {
                      name: {
                        in: input.tags,
                      },
                    },
                  },
                }
              : {},
          ],
        },
        include: {
          tags: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    }),
});