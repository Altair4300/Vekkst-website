import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "./queries/connection";
import { subadmins } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Simple rate limiter: max 5 attempts per 15 minutes per IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  record.count++;
  return true;
}

export const subadminRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(subadmins)
        .where(eq(subadmins.email, input.email))
        .limit(1);
      if (existing[0]) {
        throw new Error("Email already registered");
      }
      const hashed = await bcrypt.hash(input.password, 10);
      await db.insert(subadmins).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        password: hashed,
        status: "pending",
      });
      return { success: true };
    }),

  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers.get("x-forwarded-for") ||
        ctx.req.headers.get("x-real-ip") ||
        "unknown";
      if (!checkRateLimit(ip)) {
        return {
          success: false,
          error: "Too many attempts. Try again in 15 minutes.",
        };
      }
      const db = getDb();
      const rows = await db
        .select()
        .from(subadmins)
        .where(eq(subadmins.email, input.email))
        .limit(1);
      if (!rows[0]) {
        return { success: false, error: "Invalid email or password" };
      }
      if (rows[0].status !== "approved") {
        return { success: false, error: "Account not yet approved" };
      }
      const valid = await bcrypt.compare(input.password, rows[0].password);
      if (!valid) {
        return { success: false, error: "Invalid email or password" };
      }
      const token = jwt.sign(
        { role: "admin", isAdmin: true, subadminId: rows[0].id, type: "subadmin" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return { success: true, token, permissions: rows[0].permissions || "" };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: subadmins.id,
      name: subadmins.name,
      email: subadmins.email,
      phone: subadmins.phone,
      status: subadmins.status,
      permissions: subadmins.permissions,
      createdAt: subadmins.createdAt,
    }).from(subadmins).orderBy(desc(subadmins.createdAt));
  }),

  approve: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(subadmins)
        .set({ status: "approved" })
        .where(eq(subadmins.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(subadmins).where(eq(subadmins.id, input.id));
      return { success: true };
    }),

  updatePermissions: adminQuery
    .input(z.object({ id: z.number(), permissions: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(subadmins).set({ permissions: input.permissions.join(",") }).where(eq(subadmins.id, input.id));
      return { success: true };
    }),
});
