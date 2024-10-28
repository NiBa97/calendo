import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from '~/env';
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const attachmentRouter = createTRPCRouter({
    
  getByTask: protectedProcedure
    .input(z.object({ taskId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.attachment.findMany({
        where: { taskId: input.taskId, userId: ctx.session.user.id },
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
        taskId: z.string().cuid(),
        fileName: z.string(),
        fileKey: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId, userId: ctx.session.user.id },
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found or unauthorized",
        });
      }

      const attachment = await ctx.db.attachment.create({
        data: {
          fileName: input.fileName,
          fileKey: input.fileKey,
          taskId: input.taskId,
          userId: ctx.session.user.id,
        },
      });

      return attachment;
    }),

  delete: protectedProcedure
    .input(z.object({ fileKey: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Add your storage deletion logic here
      // await deleteFromStorage(attachment.fileKey);
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
      const command = new DeleteObjectCommand({
        Bucket: "calendo",
        Key: ctx.session.user.id + "/" + secureFileKey,
      });
      console.log(input.fileKey);
      await s3Client.send(command);
      console.log("File deleted:",ctx.session.user.id + "/" + secureFileKey,);
      return ctx.db.attachment.delete({
        where: { fileKey: input.fileKey, userId: ctx.session.user.id },
      });
    }),
});