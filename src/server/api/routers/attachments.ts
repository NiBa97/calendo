import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from '~/env';
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { ParentType } from "@prisma/client";

export const attachmentRouter = createTRPCRouter({
  getByParent: protectedProcedure
  .input(z.object({
    parentId: z.string().cuid(),
    parentType: z.nativeEnum(ParentType)
  }))
  .query(async ({ ctx, input }) => {
    type WhereClause = {
      userId: string;
      taskId?: string;
      noteId?: string;
    };

    const statement: WhereClause = {
      userId: ctx.session.user.id,
      ...(input.parentType === ParentType.TASK
        ? { taskId: input.parentId }
        : { noteId: input.parentId })
    };

    return ctx.db.attachment.findMany({
      where: statement
    });
  }),

  getAllForUser: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.attachment.findMany({
        where: { userId: ctx.session.user.id },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        parentId: z.string().cuid(),
        parentType: z.nativeEnum(ParentType),
        fileName: z.string(),
        fileKey: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if parent exists and user has access
      console.log("input", input)
      const parent = input.parentType === ParentType.TASK
        ? await ctx.db.task.findUnique({
            where: { id: input.parentId, userId: ctx.session.user.id },
          })
        : await ctx.db.note.findUnique({
            where: { id: input.parentId, userId: ctx.session.user.id },
          });
      console.log(parent)
      if (!parent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.parentType} not found or unauthorized`,
        });
      }

      // Create attachment with correct parent field
      return ctx.db.attachment.create({
        data: {
          fileName: input.fileName,
          fileKey: input.fileKey,
          parentType: input.parentType,
          userId: ctx.session.user.id,
          ...(input.parentType === ParentType.TASK
            ? { taskId: input.parentId }
            : { noteId: input.parentId })
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ fileKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First find the attachment to verify ownership
      const attachment = await ctx.db.attachment.findUnique({
        where: { fileKey: input.fileKey },
      });

      if (!attachment || attachment.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attachment not found or unauthorized",
        });
      }

      // Initialize S3 client
      const s3Client = new S3Client({
        endpoint: env.MINIO_SERVER_URL,
        credentials: {
          accessKeyId: env.MINIO_ACCESS_KEY,
          secretAccessKey: env.MINIO_SECRET_KEY,
        },
        region: "us-east-1",
        forcePathStyle: true,
      });

      const secureFileKey = input.fileKey.split('/').pop();
      
      try {
        // Delete from S3
        const command = new DeleteObjectCommand({
          Bucket: "calendo",
          Key: ctx.session.user.id + "/" + secureFileKey,
        });
        await s3Client.send(command);
        console.log("File deleted:", ctx.session.user.id + "/" + secureFileKey);

        // Delete from database
        return ctx.db.attachment.delete({
          where: { fileKey: input.fileKey, userId: ctx.session.user.id },
        });
      } catch (error) {
        console.error("Error deleting file:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file",
        });
      }
    }),
});