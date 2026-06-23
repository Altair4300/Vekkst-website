import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { writeFile, mkdir, unlink, readdir } from "fs/promises";
import { join } from "path";

// ─── Rate limiting for authenticated uploads ───
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_UPLOADS = 5;
const UPLOAD_WINDOW_MS = 60 * 1000;

function checkUploadRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = uploadAttempts.get(ip);
  if (!record || now > record.resetAt) {
    uploadAttempts.set(ip, { count: 1, resetAt: now + UPLOAD_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_UPLOADS) return false;
  record.count++;
  return true;
}

// ─── S3 config ───
const USE_S3 = !!process.env.S3_BUCKET_NAME;
const BUCKET = process.env.S3_BUCKET_NAME || "";
const REGION = process.env.AWS_REGION || "us-east-1";
const ENDPOINT = process.env.S3_ENDPOINT;

async function getS3Modules() {
  const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = await import("@aws-sdk/client-s3");
  return { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command };
}

function getS3Client(S3Client: any) {
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
  // Use Cloudflare R2 public development URL for publicly accessible files
  return `https://pub-a2177565917e494a9eb3b3e59a5ab93b.r2.dev/${key}`;
}

// ─── Categories ───
const CATEGORIES = ["hoodies", "t-shirts", "jackets", "shorts", "pants", "tracksuits", "general"];

// ─── Local filesystem fallback ───
const VIDEO_DIR = join(process.cwd(), "public", "videos");
const IMAGE_DIR = join(process.cwd(), "public", "uploads");

export const mediaRouter = createRouter({
  // Upload an image (authenticated users only — rate limited)
  uploadImage: authedQuery
    .input(z.object({
      data: z.string(),
      filename: z.string(),
      category: z.string().default("general"),
    }))
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown";
      if (!checkUploadRateLimit(ip)) {
        throw new Error("Upload rate limit exceeded. Please try again later.");
      }
      const base64Data = input.data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${Date.now()}_${input.filename}`;

      if (USE_S3) {
        try {
          const { S3Client, PutObjectCommand } = await getS3Modules();
          const key = `uploads/${input.category}/${filename}`;
          const s3 = getS3Client(S3Client);
          await s3!.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: "image/jpeg",
          }));
          console.log(`[MEDIA] S3 uploadImage OK: ${key}`);
          return { url: getS3Url(key), category: input.category };
        } catch (s3Err: any) {
          console.error("[MEDIA] S3 uploadImage failed:", s3Err?.message || s3Err);
          throw s3Err;
        }
      }

      // Fallback: local filesystem
      const uploadDir = join(process.cwd(), "public", "uploads", input.category);
      try { await mkdir(uploadDir, { recursive: true }); } catch { /* exists */ }
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);
      return { url: `/uploads/${input.category}/${filename}`, category: input.category };
    }),

  // Upload a video (authenticated users only — rate limited)
  uploadVideo: authedQuery
    .input(z.object({
      data: z.string().max(100 * 1024 * 1024, "Video data too large. Max 75MB after base64 encoding."), // ~75MB base64 = ~56MB video
      filename: z.string(),
      category: z.string().default("general"),
    }))
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown";
      if (!checkUploadRateLimit(ip)) {
        throw new Error("Upload rate limit exceeded. Please try again later.");
      }
      
      console.log(`[UPLOAD] Starting video upload from ${ip}, filename: ${input.filename}, data length: ${input.data.length} chars`);
      
      try {
        const base64Data = input.data.replace(/^data:video\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `${Date.now()}_${input.filename}`;

        console.log(`[UPLOAD] Decoded base64, buffer size: ${buffer.length} bytes`);

        if (buffer.length > 50 * 1024 * 1024) {
          throw new Error(`Video file too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB. Please compress your video before uploading.`);
        }

        if (USE_S3) {
          try {
            const { S3Client, PutObjectCommand } = await getS3Modules();
            const key = `videos/${input.category}/${filename}`;
            const s3 = getS3Client(S3Client);
            await s3!.send(new PutObjectCommand({
              Bucket: BUCKET,
              Key: key,
              Body: buffer,
              ContentType: "video/mp4",
            }));
            console.log(`[MEDIA] S3 uploadVideo OK: ${key}`);
            return { url: getS3Url(key), category: input.category };
          } catch (s3Err: any) {
            console.error("[MEDIA] S3 uploadVideo failed:", s3Err?.message || s3Err);
            throw s3Err;
          }
        }

        // Fallback: local filesystem
        const videoDir = join(process.cwd(), "public", "videos", input.category);
        try { await mkdir(videoDir, { recursive: true }); } catch { /* exists */ }
        const filePath = join(videoDir, filename);
        await writeFile(filePath, buffer);
        console.log(`[UPLOAD] Local save OK: ${filePath}`);
        return { url: `/videos/${input.category}/${filename}`, category: input.category };
      } catch (err: any) {
        console.error(`[UPLOAD] Video upload failed:`, err?.message || err);
        throw new Error(`Upload failed: ${err?.message || "Unknown error"}`);
      }
    }),

  // List all videos by category
  listVideos: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const category = input?.category;
      if (USE_S3) {
        try {
          const { S3Client, ListObjectsV2Command } = await getS3Modules();
          const s3 = getS3Client(S3Client);
          const prefix = category ? `videos/${category}/` : "videos/";
          const result = await s3!.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: prefix,
          }));
          return (result.Contents || [])
            .filter(item => item.Key && (item.Key.endsWith(".mp4") || item.Key.endsWith(".webm") || item.Key.endsWith(".mov")))
            .map(item => {
              const parts = item.Key!.split("/");
              const cat = parts.length >= 3 ? parts[1] : "general";
              return {
                name: parts[parts.length - 1] || item.Key!.replace(prefix, ""),
                url: getS3Url(item.Key!),
                category: cat,
                size: item.Size || 0,
              };
            });
        } catch (s3Err: any) {
          console.error("[MEDIA] S3 listVideos failed:", s3Err?.message || s3Err);
          return [];
        }
      }

      // Fallback: local filesystem
      try {
        if (category) {
          const dir = join(VIDEO_DIR, category);
          const files = await readdir(dir);
          return files
            .filter(f => f.endsWith(".mp4") || f.endsWith(".webm") || f.endsWith(".mov"))
            .map(f => ({ name: f, url: `/videos/${category}/${f}`, category, size: f.length }));
        } else {
          // List all categories
          const results: any[] = [];
          for (const cat of CATEGORIES) {
            try {
              const dir = join(VIDEO_DIR, cat);
              const files = await readdir(dir);
              results.push(...files
                .filter(f => f.endsWith(".mp4") || f.endsWith(".webm") || f.endsWith(".mov"))
                .map(f => ({ name: f, url: `/videos/${cat}/${f}`, category: cat, size: f.length })));
            } catch { /* skip */ }
          }
          return results;
        }
      } catch { return []; }
    }),

  // List all uploaded images by category
  listImages: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const category = input?.category;
      if (USE_S3) {
        try {
          const { S3Client, ListObjectsV2Command } = await getS3Modules();
          const s3 = getS3Client(S3Client);
          const prefix = category ? `uploads/${category}/` : "uploads/";
          const result = await s3!.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: prefix,
          }));
          return (result.Contents || [])
            .filter(item => item.Key && !item.Key.endsWith("/"))
            .map(item => {
              const parts = item.Key!.split("/");
              const cat = parts.length >= 3 ? parts[1] : "general";
              return {
                name: parts[parts.length - 1] || item.Key!.replace(prefix, ""),
                url: getS3Url(item.Key!),
                category: cat,
                size: item.Size || 0,
              };
            });
        } catch (s3Err: any) {
          console.error("[MEDIA] S3 listImages failed:", s3Err?.message || s3Err);
          return [];
        }
      }

      // Fallback: local filesystem
      try {
        if (category) {
          const dir = join(IMAGE_DIR, category);
          const files = await readdir(dir);
          return files
            .filter(f => !f.endsWith("/"))
            .map(f => ({ name: f, url: `/uploads/${category}/${f}`, category, size: f.length }));
        } else {
          // List all categories
          const results: any[] = [];
          for (const cat of CATEGORIES) {
            try {
              const dir = join(IMAGE_DIR, cat);
              const files = await readdir(dir);
              results.push(...files
                .filter(f => !f.endsWith("/"))
                .map(f => ({ name: f, url: `/uploads/${cat}/${f}`, category: cat, size: f.length })));
            } catch { /* skip */ }
          }
          return results;
        }
      } catch { return []; }
    }),

  // Delete a file (admin only)
  deleteFile: adminQuery
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      if (USE_S3) {
        const { S3Client, DeleteObjectCommand } = await getS3Modules();
        const s3 = getS3Client(S3Client);
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
