import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { users, products, quotes } from "@db/schema";
import { getDb } from "./queries/connection";
import { desc, sql, eq } from "drizzle-orm";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount, productCount, quoteCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(quotes),
    ]);
    return {
      totalCustomers: Number(userCount[0].count),
      totalProducts: Number(productCount[0].count),
      totalQuotes: Number(quoteCount[0].count),
    };
  }),

  customerList: adminQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: users.id,
      unionId: users.unionId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatar: users.avatar,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).orderBy(desc(users.createdAt));
  }),

  quoteList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }),

  updateQuote: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "processing", "quoted", "accepted", "declined"]).optional(),
        adminNotes: z.string().optional(),
        quotePrice: z.string().optional(),
        quoteTimeline: z.string().optional(),
        quoteMou: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const update: Record<string, unknown> = {};
      if (input.status) update.status = input.status;
      if (input.adminNotes !== undefined) update.adminNotes = input.adminNotes;
      if (input.quotePrice !== undefined) update.quotePrice = input.quotePrice;
      if (input.quoteTimeline !== undefined) update.quoteTimeline = input.quoteTimeline;
      if (input.quoteMou !== undefined) update.quoteMou = input.quoteMou;
      await db.update(quotes).set(update).where(eq(quotes.id, input.id));
      return { success: true };
    }),
});
