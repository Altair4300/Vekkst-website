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
  app.use("/uploads/*", serveStatic({ root: uploadsPath }));

  // ─── Uploaded videos ───
  app.use("/videos/*", serveStatic({ root: videosPath }));

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
