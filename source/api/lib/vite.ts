import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

function serveFileWithRange(c: any, filePath: string) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = c.req.header("range");
  const contentType = getContentType(filePath);

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });
    c.header("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    c.header("Accept-Ranges", "bytes");
    c.header("Content-Length", chunksize.toString());
    c.header("Content-Type", contentType);
    c.header("Cache-Control", "public, max-age=86400");
    return c.body(stream, 206);
  }

  const stream = fs.createReadStream(filePath);
  c.header("Content-Length", fileSize.toString());
  c.header("Content-Type", contentType);
  c.header("Accept-Ranges", "bytes");
  c.header("Cache-Control", "public, max-age=86400");
  return c.body(stream, 200);
}

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const uploadsPath = path.resolve(process.cwd(), "public", "uploads");
  const videosPath = path.resolve(process.cwd(), "public", "videos");

  console.log(`[STATIC] distPath=${distPath}, uploadsPath=${uploadsPath}, videosPath=${videosPath}`);

  // ─── Uploaded images (check public/uploads/ then dist/public/uploads/) ───
  app.use("/uploads/*", async (c, next) => {
    const relativePath = c.req.path.replace("/uploads/", "");
    const filePath = path.join(uploadsPath, relativePath);
    const fallbackPath = path.join(distPath, "uploads", relativePath);
    const resolvedPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
      ? filePath
      : fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()
        ? fallbackPath
        : null;
    if (resolvedPath) {
      return serveFileWithRange(c, resolvedPath);
    }
    await next();
  });

  // ─── Uploaded videos (check public/videos/ then dist/public/videos/) ───
  app.use("/videos/*", async (c, next) => {
    const relativePath = c.req.path.replace("/videos/", "");
    const filePath = path.join(videosPath, relativePath);
    const fallbackPath = path.join(distPath, "videos", relativePath);
    const resolvedPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
      ? filePath
      : fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()
        ? fallbackPath
        : null;
    if (resolvedPath) {
      return serveFileWithRange(c, resolvedPath);
    }
    await next();
  });

  // ─── Built frontend assets ───
  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    const reqPath = c.req.path;
    console.log(`[STATIC] notFound: path=${reqPath} accept=${accept}`);

    if (reqPath.startsWith("/uploads/") || reqPath.startsWith("/videos/") || reqPath.startsWith("/images/")) {
      return c.json({ error: "Not Found" }, 404);
    }

    if (!accept.includes("text/html") && !accept.includes("*/*")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      console.error(`[STATIC] index.html not found at ${indexPath}`);
      return c.json({ error: "index.html not found" }, 500);
    }
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
