import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "../queries/connection";

export const contentRouter = createRouter({
  // Get all sections for a page
  list: publicQuery
    .input(z.object({ page: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (input.page) {
        return await db.selectFrom("pageSections")
          .selectAll()
          .where("page", "=", input.page)
          .where("isActive", "=", "1")
          .orderBy("sortOrder")
          .execute();
      }
      return await db.selectFrom("pageSections")
        .selectAll()
        .where("isActive", "=", "1")
        .orderBy("page")
        .orderBy("sortOrder")
        .execute();
    }),

  // Get a single section by page + section key
  get: publicQuery
    .input(z.object({ page: z.string(), section: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.selectFrom("pageSections")
        .selectAll()
        .where("page", "=", input.page)
        .where("section", "=", input.section)
        .executeTakeFirst();
      return result || null;
    }),

  // Upsert a section (admin only)
  upsert: adminQuery
    .input(z.object({
      page: z.string().min(1),
      section: z.string().min(1),
      type: z.enum(["image", "video", "text", "html"]),
      content: z.string().min(1),
      label: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.selectFrom("pageSections")
        .select("id")
        .where("page", "=", input.page)
        .where("section", "=", input.section)
        .executeTakeFirst();

      if (existing) {
        await db.updateTable("pageSections")
          .set({
            type: input.type,
            content: input.content,
            label: input.label || null,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive ? "1" : "0",
          })
          .where("id", "=", existing.id)
          .execute();
        return { success: true, id: existing.id, action: "updated" };
      } else {
        const result = await db.insertInto("pageSections")
          .values({
            page: input.page,
            section: input.section,
            type: input.type,
            content: input.content,
            label: input.label || null,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive !== false ? "1" : "0",
          })
          .executeTakeFirst();
        return { success: true, id: Number(result.insertId), action: "created" };
      }
    }),

  // Delete a section (admin only)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.deleteFrom("pageSections")
        .where("id", "=", input.id)
        .execute();
      return { success: true };
    }),

  // Bulk update sort order (admin only)
  reorder: adminQuery
    .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        await db.updateTable("pageSections")
          .set({ sortOrder: item.sortOrder })
          .where("id", "=", item.id)
          .execute();
      }
      return { success: true };
    }),
});
