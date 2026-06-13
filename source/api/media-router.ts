import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { writeFile, mkdir, unlink, readdir } from "fs/promises";
import { join } from "path";

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
      try { await mkdir(VIDEO_DIR, { recursive: true }); } catch { /* exists */ }
      const filePath = join(VIDEO_DIR, filename);
      await writeFile(filePath, buffer);
      return { url: `/videos/${filename}` };
    }),

  // List all videos
  listVideos: publicQuery.query(async () => {
    try {
      const files = await readdir(VIDEO_DIR);
      return files
        .filter(f => f.endsWith(".mp4") || f.endsWith(".webm") || f.endsWith(".mov"))
        .map(f => ({ name: f, url: `/videos/${f}`, size: f.length }));
    } catch {
      return [];
    }
  }),

  // List all uploaded images
  listImages: publicQuery.query(async () => {
    try {
      const files = await readdir(IMAGE_DIR);
      return files
        .filter(f => f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png") || f.endsWith(".webp"))
        .map(f => ({ name: f, url: `/uploads/${f}` }));
    } catch {
      return [];
    }
  }),

  // Delete a file
  deleteFile: publicQuery
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      const filePath = join(process.cwd(), "public", input.path.replace(/^\//, ""));
      try {
        await unlink(filePath);
        return { success: true };
      } catch {
        return { success: false };
      }
    }),
});
