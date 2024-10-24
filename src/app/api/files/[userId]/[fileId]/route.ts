import { type NextRequest } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { RateLimiter } from "limiter";





// localhost:3000/api/files/clx75zjw50000ijwkibj8202o/yecp7gh5tbfspakgcw9wlwzz

const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const mimeTypes: Record<string, string> = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Text
      'txt': 'text/plain',
      'csv': 'text/csv',
      'md': 'text/markdown',
      'rtf': 'application/rtf',
      
      // Web
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'json': 'application/json',
      
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'm4a': 'audio/mp4',
      
      // Video
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      
      // Other
      'xml': 'application/xml',
      'bin': 'application/octet-stream',
      'exe': 'application/octet-stream',
      'dll': 'application/octet-stream'
    };
  
    return mimeTypes[ext] ?? 'application/octet-stream'; // Default to binary if unknown
  };

const s3Client = new S3Client({
  endpoint: env.MINIO_SERVER_URL,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
  region: "us-east-1",
  forcePathStyle: true,
});

// Create rate limiter - 100 requests per IP per minute
const rateLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute",
  fireImmediately: true,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; fileId: string } }
) {
  try {

    // Rate limiting using IP
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown";
    const remainingRequests = await rateLimiter.removeTokens(1);
    if (remainingRequests < 0) {
      return new Response("Too Many Requests", { status: 429 });
    }

    const { userId, fileId } = params;
    // Get session
    const session = await getServerAuthSession();
    console.log(session)
    if (!session || session.user.id !== userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get file from S3
    const command = new GetObjectCommand({
      Bucket: "calendo",
      Key: userId +"/"+fileId,
    });

    const s3Response = await s3Client.send(command);

    // Optionally, you might want to force download for certain file types
    const forceDownloadTypes = new Set([
        'application/octet-stream',
        'application/x-rar-compressed',
        'application/zip',
        'application/x-7z-compressed',
        'application/gzip',
        'application/x-tar',
        'application/exe'
    ]);
    
    // Optional: Modify the Content-Disposition based on file type
    const contentType = getMimeType(fileId);
    const disposition = forceDownloadTypes.has(contentType) ? 'attachment' : 'inline';
    
    const headers = new Headers({
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${fileId}"`,
        "Cache-Control": "public, max-age=3600",
        // Optional: Add security headers for certain file types
        ...(contentType.startsWith('text/') ?? contentType === 'application/javascript'
        ? {
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'"
            }
        : {})
    });

    // Stream the response
    if (!s3Response.Body) {
      throw new Error("No body in S3 response");
    }

    // @ts-expect-error - Body exists and is streamable
    return new Response(s3Response.Body, { headers });
  } catch (error) {
    console.error("File access error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
