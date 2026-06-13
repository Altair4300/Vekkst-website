import { z } from "zod";
import { eq, and, like, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products } from "@db/schema";

export const productRouter = createRouter({
  list: publicQuery
    .input(z.object({ category: z.string().optional(), season: z.string().optional(), search: z.string().optional(), sort: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.category) conditions.push(eq(products.category, input.category));
      if (input?.season) conditions.push(eq(products.season, input.season));
      if (input?.search) conditions.push(like(products.name, `%${input.search}%`));
      let query = db.select().from(products);
      if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
      query = query.orderBy(desc(products.createdAt)) as typeof query;
      return query;
    }),

  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const result = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
    return result[0] || null;
  }),

  create: publicQuery
    .input(z.object({ name: z.string().min(1), slug: z.string().min(1), category: z.string(), description: z.string().optional(), image: z.string(), badge: z.string().optional(), sizes: z.string().optional(), season: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      return db.insert(products).values(input);
    }),

  update: publicQuery
    .input(z.object({ id: z.number(), name: z.string().optional(), slug: z.string().optional(), category: z.string().optional(), description: z.string().optional(), image: z.string().optional(), badge: z.string().optional(), sizes: z.string().optional(), season: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      return db.update(products).set(data).where(eq(products.id, id));
    }),

  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(products).where(eq(products.id, input.id));
    return { success: true };
  }),

  uploadImage: publicQuery
    .input(z.object({ data: z.string(), filename: z.string() }))
    .mutation(async ({ input }) => {
      const base64Data = input.data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${Date.now()}_${input.filename}`;
      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      try { await fs.mkdir(uploadDir, { recursive: true }); } catch { /* exists */ }
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      return { url: `/uploads/${filename}` };
    }),
});
