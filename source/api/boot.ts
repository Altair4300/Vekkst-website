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

    // Step 2.5: Create page_sections table for CMS content management (idempotent).
    // Stores dynamic content (images, videos, text) per page/section.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page VARCHAR(50) NOT NULL,
        section VARCHAR(100) NOT NULL,
        type ENUM('image', 'video', 'text', 'html') DEFAULT 'text' NOT NULL,
        content TEXT NOT NULL,
        label VARCHAR(255),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_page_section (page, section)
      )
    `);
    console.log("[BOOT] Migration: page_sections table OK");

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
  // CORS: allow admin panel and any origin for API calls
  const origin = c.req.header("origin") || "";
  const allowedOrigins = [
    "https://vekkst-admin-vkkst.up.railway.app",
    "https://intuitive-wonder-vkkst.up.railway.app",
  ];
  if (allowedOrigins.includes(origin) || origin.endsWith(".railway.app")) {
    c.header("Access-Control-Allow-Origin", origin);
  } else {
    c.header("Access-Control-Allow-Origin", "*");
  }
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-token, x-local-auth-token");
  c.header("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight OPTIONS requests
  if (c.req.method === "OPTIONS") {
    return c.text("", 204);
  }
  
  c.header("X-Frame-Options", "DENY");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self' https://libretranslate.de; frame-ancestors 'none'; base-uri 'self';");
  await next();
});

// Simple health check endpoint (no DB required)
app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Server-side redirect for /admin to separate admin panel service
// (Works with HashRouter — client-side /admin route is kept as fallback)
app.get("/admin", (c) => c.redirect("https://vekkst-admin-vkkst.up.railway.app", 302));

// tRPC API handler - match both /api/trpc and /api/trpc/*
app.use("/api/trpc", async (c) => {
  const res = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
  // Merge CORS headers from context into the tRPC response
  const newHeaders = new Headers(res.headers);
  c.res.headers.forEach((value, key) => {
    newHeaders.set(key, value);
  });
  return new Response(res.body, { status: res.status, headers: newHeaders });
});
app.use("/api/trpc/*", async (c) => {
  const res = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
  // Merge CORS headers from context into the tRPC response
  const newHeaders = new Headers(res.headers);
  c.res.headers.forEach((value, key) => {
    newHeaders.set(key, value);
  });
  return new Response(res.body, { status: res.status, headers: newHeaders });
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
