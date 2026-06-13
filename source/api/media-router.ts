import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { writeFile, mkdir, unlink, readdir } from "fs/promises";
import { join } from "path";

// ─── S3 config ───
const USE_S3 = !!process.env.S3_BUCKET_NAME;
const BUCKET = process.env.S3_BUCKET_NAME || "";
const REGION = process.env.AWS_REGION || "us-east-1";
const ENDPOINT = process.env.S3_ENDPOINT;

function getS3Client() {
  if (!USE_S3) return null;
  const config: any = {
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  };
  if (ENDPOINT) {
    config.endpoint = ENDPOINT;
    config.forcePathStyle = true;
  }
  return new S3Client(config);
}

function getS3Url(key: string) {
  if (ENDPOINT) {
    return `${ENDPOINT}/${BUCKET}/${key}`;
  }
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

// ─── Local filesystem fallback ───
const VIDEO_DIR = join(process.cwd(), "public", "videos");
const IMAGE_DIR = join(process.cwd(), "public", "uploads");

export const mediaRouter = createRouter({
  // Upload an image
  uploadImage: publicQuery
    .input(z.object({ data: z.string(), filename: z.string(), folder: z.string().default("uploads") }))
    .mutation(async ({ input }) => {
      const base64Data = input.data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${Date.now()}_${input.filename}`;

      if (USE_S3) {
        const key = `${input.folder}/${filename}`;
        const s3 = getS3Client();
        await s3!.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: "image/jpeg",
        }));
        return { url: getS3Url(key) };
      }

      // Fallback: local filesystem
      const uploadDir = join(process.cwd(), "public", input.folder);
      try { await mkdir(uploadDir, { recursive: true }); } catch { /* exists */ }
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);
      return { url: `/${input.folder}/${filename}` };
    }),

  // Upload a video
  uploadVideo: publicQuery
    .input(z.object({ data: z.string(), filename: z.string() }))
    .mutation(async ({ input }) => {
      const base64Data = input.data.replace(/^data:video\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${Date.now()}_${input.filename}`;

      if (USE_S3) {
        const key = `videos/${filename}`;
        const s3 = getS3Client();
        await s3!.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: "video/mp4",
        }));
        return { url: getS3Url(key) };
      }

      // Fallback: local filesystem
      try { await mkdir(VIDEO_DIR, { recursive: true }); } catch { /* exists */ }
      const filePath = join(VIDEO_DIR, filename);
      await writeFile(filePath, buffer);
      return { url: `/videos/${filename}` };
    }),

  // List all videos
  listVideos: publicQuery.query(async () => {
    if (USE_S3) {
      try {
        const s3 = getS3Client();
        const result = await s3!.send(new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: "videos/",
        }));
        return (result.Contents || [])
          .filter(item => item.Key && (item.Key.endsWith(".mp4") || item.Key.endsWith(".webm") || item.Key.endsWith(".mov")))
          .map(item => ({
            name: item.Key!.replace("videos/", ""),
            url: getS3Url(item.Key!),
            size: item.Size || 0,
          }));
      } catch { return []; }
    }

    // Fallback: local filesystem
    try {
      const files = await readdir(VIDEO_DIR);
      return files
        .filter(f => f.endsWith(".mp4") || f.endsWith(".webm") || f.endsWith(".mov"))
        .map(f => ({ name: f, url: `/videos/${f}`, size: f.length }));
    } catch { return []; }
  }),

  // List all uploaded images
  listImages: publicQuery.query(async () => {
    if (USE_S3) {
      try {
        const s3 = getS3Client();
        const result = await s3!.send(new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: "uploads/",
        }));
        return (result.Contents || [])
          .filter(item => item.Key && !item.Key.endsWith("/"))
          .map(item => ({
            name: item.Key!.replace("uploads/", ""),
            url: getS3Url(item.Key!),
            size: item.Size || 0,
          }));
      } catch { return []; }
    }

    // Fallback: local filesystem
    try {
      const files = await readdir(IMAGE_DIR);
      return files
        .filter(f => !f.endsWith("/"))
        .map(f => ({ name: f, url: `/uploads/${f}`, size: f.length }));
    } catch { return []; }
  }),

  // Delete a file
  deleteFile: publicQuery
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      if (USE_S3) {
        const s3 = getS3Client();
        // Extract key from full URL or relative path
        let key = input.path;
        if (key.startsWith("http")) {
          key = key.split(".amazonaws.com/")[1] || key.split(`/${BUCKET}/`)[1] || key;
        }
        if (key.startsWith("/")) key = key.slice(1);
        await s3!.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
        return { success: true };
      }

      // Fallback: local filesystem
      const filePath = join(process.cwd(), "public", input.path);
      try { await unlink(filePath); } catch { /* ignore */ }
      return { success: true };
    }),
});
