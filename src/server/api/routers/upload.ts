import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createId } from '@paralleldrive/cuid2';
import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";
import { z } from "zod";
import { env } from '~/env';

export const uploadRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const s3Client = new S3Client({
        endpoint: env.MINIO_SERVER_URL,
        credentials: {
          accessKeyId: env.MINIO_ACCESS_KEY,
          secretAccessKey: env.MINIO_SECRET_KEY,
        },
        region: "us-east-1",
        forcePathStyle: true,
      });

      const fileExtension = input.fileName.split('.').pop() ?? '';
      const uniqueId = createId();  
      const key = `${ctx.session.user.id}/${uniqueId}.${fileExtension}`;

      const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: "calendo",
        Key: key,
        Fields: {
          'Content-Type': input.fileType,
        },
        Conditions: [
          ["content-length-range", 0, 10485760], // up to 10MB
          ["eq", "$Content-Type", input.fileType],
        ],
        Expires: 600,
      });

      return { url, fields, key, };
    }),
    getSignedViewUrl: protectedProcedure
    .input(z.object({
      key: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Ensure user can only access their own files
      if (!input.key.startsWith(ctx.session.user.id + '/')) {
        throw new Error('Unauthorized access to file');
      }

      const s3Client = new S3Client({
        endpoint: env.MINIO_SERVER_URL,
        credentials: {
          accessKeyId: env.MINIO_ACCESS_KEY,
          secretAccessKey: env.MINIO_SECRET_KEY,
        },
        region: "us-east-1",
        forcePathStyle: true,
      });

      const command = new GetObjectCommand({
        Bucket: "calendo",
        Key: input.key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
      return { signedUrl };
    }),
});