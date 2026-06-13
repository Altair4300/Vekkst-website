import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
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

// ─── Categories ───
const CATEGORIES = ["hoodies", "t-shirts", "jackets", "shorts", "pants", "tracksuits", "general"];

// ─── Local filesystem fallback ───
const VIDEO_DIR = join(process.cwd(), "public", "videos");
const IMAGE_DIR = join(process.cwd(), "public", "uploads");

export const mediaRouter = createRouter({
  // Upload an image (organized by category)
  uploadImage: adminQuery
    .input(z.object({
      data: z.string(),
      filename: z.string(),
      category: z.enum(["hoodies", "t-shirts", "jackets", "shorts", "pants", "tracksuits", "general"]).default("general"),
    }))
    .mutation(async ({ input }) => {
      const base64Data = input.data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${Date.now()}_${input.filename}`;

      if (USE_S3) {
        const key = `uploads/${input.category}/${filename}`;
        const s3 = getS3Client();
        await s3!.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: "image/jpeg",
        }));
        return { url: getS3Url(key), category: input.category };
      }

      // Fallback: local filesystem
      const uploadDir = join(process.cwd(), "public", "uploads", input.category);
      try { await mkdir(uploadDir, { recursive: true }); } catch { /* exists */ }
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);
      return { url: `/uploads/${input.category}/${filename}`, category: input.category };
    }),

  // Upload a video (organized by category)
  uploadVideo: adminQuery
    .input(z.object({
      data: z.string(),
      filename: z.string(),
      category: z.enum(["hoodies", "t-shirts", "jackets", "shorts", "pants", "tracksuits", "general"]).default("general"),
    }))
    .mutation(async ({ input }) => {
      const base64Data = input.data.replace(/^data:video\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${Date.now()}_${input.filename}`;

      if (USE_S3) {
        const key = `videos/${input.category}/${filename}`;
        const s3 = getS3Client();
        await s3!.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: "video/mp4",
        }));
        return { url: getS3Url(key), category: input.category };
      }

      // Fallback: local filesystem
      const videoDir = join(process.cwd(), "public", "videos", input.category);
      try { await mkdir(videoDir, { recursive: true }); } catch { /* exists */ }
      const filePath = join(videoDir, filename);
      await writeFile(filePath, buffer);
      return { url: `/videos/${input.category}/${filename}`, category: input.category };
    }),

  // List all videos by category
  listVideos: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const category = input?.category;
      if (USE_S3) {
        try {
          const s3 = getS3Client();
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
        } catch { return []; }
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
          const s3 = getS3Client();
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
        } catch { return []; }
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
