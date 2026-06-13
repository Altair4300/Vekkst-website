import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "vekkst-secret-key";

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(z.object({ name: z.string().min(1), email: z.string().email(), phone: z.string().optional(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing[0]) throw new Error("Email already registered");
      const hashed = await bcrypt.hash(input.password, 10);
      const result = await db.insert(users).values({ ...input, password: hashed, role: "user" });
      const userId = Number(result[0].insertId);
      const token = jwt.sign({ userId, email: input.email }, JWT_SECRET, { expiresIn: "30d" });
      return { token, user: { id: userId, name: input.name, email: input.email, role: "user" } };
    }),

  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!user[0] || !user[0].password) throw new Error("Invalid email or password");
      const valid = await bcrypt.compare(input.password, user[0].password);
      if (!valid) throw new Error("Invalid email or password");
      const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, { expiresIn: "30d" });
      return { token, user: { id: user[0].id, name: user[0].name, email: user[0].email, role: user[0].role } };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-local-auth-token");
    if (!token) return null;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const db = getDb();
      const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (!user[0]) return null;
      return { id: user[0].id, name: user[0].name, email: user[0].email, role: user[0].role, phone: user[0].phone, avatar: user[0].avatar };
    } catch { return null; }
  }),
});
