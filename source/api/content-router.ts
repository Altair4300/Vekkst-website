import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pageSections } from "@db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export const contentRouter = createRouter({
  // Get all sections for a page
  list: publicQuery
    .input(z.object({ page: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (input.page) {
        return await db
          .select()
          .from(pageSections)
          .where(
            and(
              eq(pageSections.page, input.page),
              eq(pageSections.isActive, "1")
            )
          )
          .orderBy(asc(pageSections.sortOrder));
      }
      return await db
        .select()
        .from(pageSections)
        .where(eq(pageSections.isActive, "1"))
        .orderBy(asc(pageSections.page), asc(pageSections.sortOrder));
    }),

  // Get a single section by page + section key
  get: publicQuery
    .input(z.object({ page: z.string(), section: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(pageSections)
        .where(
          and(
            eq(pageSections.page, input.page),
            eq(pageSections.section, input.section)
          )
        )
        .limit(1);
      return result[0] || null;
    }),

  // Upsert a section (admin only)
  upsert: adminQuery
    .input(
      z.object({
        id: z.number().optional(),
        page: z.string().min(1),
        section: z.string().min(1),
        type: z.enum(["image", "video", "text", "html"]),
        content: z.string().min(1),
        mobileContent: z.string().optional(),
        label: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.string().optional(), // "1" or "0"
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.id) {
        // Update existing by id
        await db
          .update(pageSections)
          .set({
            page: input.page,
            section: input.section,
            type: input.type,
            content: input.content,
            mobileContent: input.mobileContent || null,
            label: input.label || null,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive === "0" ? "0" : "1",
            updatedAt: new Date(),
          })
          .where(eq(pageSections.id, input.id));
        return { success: true, id: input.id, action: "updated" };
      }

      // Check if section already exists for this page
      const existing = await db
        .select()
        .from(pageSections)
        .where(
          and(
            eq(pageSections.page, input.page),
            eq(pageSections.section, input.section)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(pageSections)
          .set({
            type: input.type,
            content: input.content,
            mobileContent: input.mobileContent || null,
            label: input.label || null,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive === "0" ? "0" : "1",
            updatedAt: new Date(),
          })
          .where(eq(pageSections.id, existing[0].id));
        return { success: true, id: existing[0].id, action: "updated" };
      }

      // Insert new
      const result = await db.insert(pageSections).values({
        page: input.page,
        section: input.section,
        type: input.type,
        content: input.content,
        mobileContent: input.mobileContent || null,
        label: input.label || null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive === "0" ? "0" : "1",
      });
      return {
        success: true,
        id: Number(result.insertId),
        action: "created",
      };
    }),

  // Delete a section (admin only)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(pageSections).where(eq(pageSections.id, input.id));
      return { success: true };
    }),

  // Bulk update sort order (admin only)
  reorder: adminQuery
    .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        await db
          .update(pageSections)
          .set({ sortOrder: item.sortOrder })
          .where(eq(pageSections.id, item.id));
      }
      return { success: true };
    }),
});
