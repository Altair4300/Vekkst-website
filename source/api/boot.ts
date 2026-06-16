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

    // Step 1: Create subadmins table (idempotent)
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
    console.log("[BOOT] Migration: subadmins table OK");

    // Step 2: Create quote_messages table with all required columns (idempotent).
    // Must be created BEFORE any ALTER TABLE statements that reference it.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quote_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quoteId VARCHAR(20) NOT NULL,
        sender ENUM('customer', 'admin') NOT NULL,
        senderName VARCHAR(255),
        message TEXT NOT NULL,
        type ENUM('text', 'image', 'video') DEFAULT 'text' NOT NULL,
        fileUrl VARCHAR(500),
        \`read\` ENUM('0', '1') DEFAULT '0' NOT NULL,
        readByCustomer ENUM('0', '1') DEFAULT '0' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("[BOOT] Migration: quote_messages table OK");

    // Step 3: Apply additive ALTER TABLE migrations for columns added after initial deploy.
    // MySQL 9.7.0 does not support IF NOT EXISTS in ALTER TABLE ADD COLUMN.
    // Wrap each statement in a try-catch and ignore error 1060 (column already exists).
    const alterStatements: Array<{ ddl: string; label: string }> = [
      {
        ddl: `ALTER TABLE subadmins ADD COLUMN permissions VARCHAR(255) DEFAULT NULL`,
        label: "subadmins.permissions",
      },
      {
        ddl: `ALTER TABLE quote_messages ADD COLUMN type ENUM('text', 'image', 'video') DEFAULT 'text' NOT NULL`,
        label: "quote_messages.type",
      },
      {
        ddl: `ALTER TABLE quote_messages ADD COLUMN fileUrl VARCHAR(500) DEFAULT NULL`,
        label: "quote_messages.fileUrl",
      },
    ];

    for (const { ddl, label } of alterStatements) {
      try {
        await pool.query(ddl);
        console.log(`[BOOT] Migration: added column ${label}`);
      } catch (err: any) {
        if (err?.errno === 1060) {
          // Column already exists — safe to ignore on re-deploy
          console.log(`[BOOT] Migration: column ${label} already exists, skipping`);
        } else {
          console.error(`[BOOT] Migration: failed to add column ${label}:`, err?.message || err);
          throw err;
        }
      }
    }

    await pool.end();
    console.log("[BOOT] All migrations completed successfully");
  } catch (err) {
    console.error("[BOOT] Migration error:", err);
  }
}

// Security headers middleware
app.use("*", async (c, next) => {
  c.header("X-Frame-Options", "DENY");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self' https://libretranslate.de; frame-ancestors 'none'; base-uri 'self';");
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
