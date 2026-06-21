import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Use process.cwd() since npm start runs from /app/source where dist/public exists
  const distPath = path.resolve(process.cwd(), "dist/public");
  const uploadsPath = path.resolve(process.cwd(), "public", "uploads");
  const videosPath = path.resolve(process.cwd(), "public", "videos");

  console.log(`[STATIC] distPath=${distPath}, uploadsPath=${uploadsPath}, videosPath=${videosPath}`);

  // ─── Uploaded images ───
  app.use("/uploads/*", async (c, next) => {
    const relativePath = c.req.path.replace("/uploads/", "");
    const filePath = path.join(uploadsPath, relativePath);
    const exists = fs.existsSync(filePath);
    console.log(`[STATIC] uploads request: ${c.req.path} -> ${filePath} exists=${exists}`);
    if (exists) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
        ext === ".png" ? "image/png" :
        ext === ".gif" ? "image/gif" :
        ext === ".webp" ? "image/webp" :
        ext === ".svg" ? "image/svg+xml" :
        "application/octet-stream";
      return c.body(fs.readFileSync(filePath), 200, {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      });
    }
    await next();
  });

  // ─── Uploaded videos ───
  app.use("/videos/*", async (c, next) => {
    const relativePath = c.req.path.replace("/videos/", "");
    const filePath = path.join(videosPath, relativePath);
    const exists = fs.existsSync(filePath);
    console.log(`[STATIC] videos request: ${c.req.path} -> ${filePath} exists=${exists}`);
    if (exists) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".mp4" ? "video/mp4" :
        ext === ".webm" ? "video/webm" :
        ext === ".mov" ? "video/quicktime" :
        "application/octet-stream";
      return c.body(fs.readFileSync(filePath), 200, {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      });
    }
    await next();
  });

  // ─── Built frontend assets ───
  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    const reqPath = c.req.path;
    console.log(`[STATIC] notFound: path=${reqPath} accept=${accept}`);

    // Don't serve index.html for asset requests (images, videos, etc.)
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
