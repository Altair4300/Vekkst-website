import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { users } from "@db/schema";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: typeof users.$inferSelect;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // 1. Check for regular user auth token (x-local-auth-token header)
  try {
    const token = opts.req.headers.get("x-local-auth-token");
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const db = getDb();
      const rows = await db.select().from(schema.users).where(eq(schema.users.id, decoded.userId)).limit(1);
      if (rows[0]) ctx.user = rows[0];
    }
  } catch {
    // Auth is optional - user stays undefined for public endpoints
  }

  // 2. Check for admin auth token (x-admin-token header)
  // If no regular user is found, check if admin token is present
  if (!ctx.user) {
    try {
      const adminToken = opts.req.headers.get("x-admin-token");
      if (adminToken) {
        const decoded = jwt.verify(adminToken, JWT_SECRET) as { role: string; isAdmin: boolean; subadminId?: number };
        if (decoded.role === "admin" && decoded.isAdmin) {
          // Create a synthetic admin user for middleware checks
          ctx.user = {
            id: 0,
            unionId: null,
            name: decoded.subadminId ? "Subadmin" : "Admin",
            email: "admin@vekkst.com",
            phone: null,
            avatar: null,
            role: "admin",
            password: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as typeof users.$inferSelect;
        }
      }
    } catch {
      // Admin auth is optional
    }
  }

  return ctx;
}
