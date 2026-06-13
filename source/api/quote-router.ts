import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { quotes } from "@db/schema";
import { getDb } from "./queries/connection";
import { eq, desc } from "drizzle-orm";

function generateQuoteId(): string {
  const prefix = "Q";
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${date}-${random}`;
}

export const quoteRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().optional(),
        phone: z.string().optional(),
        productType: z.string().optional(),
        quantity: z.string().optional(),
        fabric: z.string().optional(),
        sizeRange: z.string().optional(),
        deadline: z.string().optional(),
        requirements: z.string().optional(),
        designFiles: z.string().optional(),
        productRef: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const quoteId = generateQuoteId();
      await db.insert(quotes).values({
        quoteId,
        name: input.name,
        email: input.email,
        company: input.company || null,
        phone: input.phone || null,
        productType: input.productType || null,
        quantity: input.quantity || null,
        fabric: input.fabric || null,
        sizeRange: input.sizeRange || null,
        deadline: input.deadline || null,
        requirements: input.requirements || null,
        designFiles: input.designFiles || null,
        productRef: input.productRef || null,
      });
      return { success: true, quoteId };
    }),

  track: publicQuery
    .input(z.object({ email: z.string().email(), quoteId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(quotes).where(eq(quotes.quoteId, input.quoteId)).limit(1);
      if (!result.length) throw new Error("Quote not found");
      const q = result[0];
      if (q.email.toLowerCase() !== input.email.toLowerCase()) throw new Error("Email does not match");
      return q;
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }),

  updateStatus: publicQuery
    .input(z.object({ id: z.number(), status: z.enum(["new", "processing", "quoted", "accepted", "declined"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(quotes).set({ status: input.status }).where(eq(quotes.id, input.id));
      return { success: true };
    }),

  addResponse: publicQuery
    .input(
      z.object({
        id: z.number(),
        adminNotes: z.string().optional(),
        quotePrice: z.string().optional(),
        quoteTimeline: z.string().optional(),
        quoteMou: z.string().optional(),
        status: z.enum(["new", "processing", "quoted", "accepted", "declined"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const update: Record<string, unknown> = {};
      if (input.adminNotes !== undefined) update.adminNotes = input.adminNotes;
      if (input.quotePrice !== undefined) update.quotePrice = input.quotePrice;
      if (input.quoteTimeline !== undefined) update.quoteTimeline = input.quoteTimeline;
      if (input.quoteMou !== undefined) update.quoteMou = input.quoteMou;
      if (input.status) update.status = input.status;
      await db.update(quotes).set(update).where(eq(quotes.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(quotes);
    return {
      total: all.length,
      new: all.filter((q) => q.status === "new").length,
      processing: all.filter((q) => q.status === "processing").length,
      quoted: all.filter((q) => q.status === "quoted").length,
      accepted: all.filter((q) => q.status === "accepted").length,
      declined: all.filter((q) => q.status === "declined").length,
    };
  }),
});
