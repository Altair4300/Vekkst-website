import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import mysql from "mysql2/promise";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Auto-run simple migrations on startup (production only)
async function runStartupMigrations() {
  try {
    const pool = mysql.createPool(env.databaseUrl);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subadmins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(320) NOT NULL UNIQUE,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved') DEFAULT 'pending' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await pool.end();
    console.log("[BOOT] Migrations OK: subadmins table ready");
  } catch (err) {
    console.error("[BOOT] Migration warning:", err);
  }
}

// Security headers middleware
app.use("*", async (c, next) => {
  c.header("X-Frame-Options", "DENY");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("X-XSS-Protection", "1; mode=block");
  await next();
});

// Simple health check endpoint (no DB required)
app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

// tRPC API handler - match both /api/trpc and /api/trpc/*
app.use("/api/trpc", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  await runStartupMigrations();
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  console.log(`[BOOT] Starting production server on port ${port}...`);
  console.log(`[BOOT] NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`[BOOT] CWD=${process.cwd()}`);
  
  serve({ fetch: app.fetch, port }, () => {
    console.log(`[BOOT] Server running on port ${port}`);
  });
}
