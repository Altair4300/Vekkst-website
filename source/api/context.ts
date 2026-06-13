import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { users } from "@db/schema";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "vekkst-secret-key";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: typeof users.$inferSelect;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Authenticate via local auth token (x-local-auth-token header)
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

  return ctx;
}
