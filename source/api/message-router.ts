import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { quoteMessages, quotes } from "@db/schema";
import { getDb } from "./queries/connection";
import { eq, desc, and, sql } from "drizzle-orm";

export const messageRouter = createRouter({
  // Send a message (customer or admin)
  send: publicQuery
    .input(
      z.object({
        quoteId: z.string().min(1),
        sender: z.enum(["customer", "admin"]),
        senderName: z.string().optional(),
        message: z.string().min(1),
        type: z.enum(["text", "image", "video"]).optional(),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // Verify quote exists
      const quote = await db.select().from(quotes).where(eq(quotes.quoteId, input.quoteId)).limit(1);
      if (!quote.length) throw new Error("Quote not found");

      const result = await db.insert(quoteMessages).values({
        quoteId: input.quoteId,
        sender: input.sender,
        senderName: input.senderName || null,
        message: input.message,
        type: input.type || "text",
        fileUrl: input.fileUrl || null,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Get conversation by quoteId (admin view)
  getByQuoteId: adminQuery
    .input(z.object({ quoteId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const messages = await db
        .select()
        .from(quoteMessages)
        .where(eq(quoteMessages.quoteId, input.quoteId))
        .orderBy(quoteMessages.createdAt);

      // Mark customer messages as read by admin
      await db
        .update(quoteMessages)
        .set({ read: "1" })
        .where(and(eq(quoteMessages.quoteId, input.quoteId), eq(quoteMessages.sender, "customer")));

      return messages;
    }),

  // Get conversation by quoteId + email (customer view)
  getConversation: publicQuery
    .input(z.object({ quoteId: z.string(), email: z.string().email() }))
    .query(async ({ input }) => {
      const db = getDb();
      // Verify quote belongs to email
      const quote = await db.select().from(quotes).where(eq(quotes.quoteId, input.quoteId)).limit(1);
      if (!quote.length) throw new Error("Quote not found");
      if (quote[0].email.toLowerCase() !== input.email.toLowerCase()) throw new Error("Email does not match");

      const messages = await db
        .select()
        .from(quoteMessages)
        .where(eq(quoteMessages.quoteId, input.quoteId))
        .orderBy(quoteMessages.createdAt);

      // Mark admin messages as read by customer
      await db
        .update(quoteMessages)
        .set({ readByCustomer: "1" })
        .where(and(eq(quoteMessages.quoteId, input.quoteId), eq(quoteMessages.sender, "admin")));

      return messages;
    }),

  // List all conversations (admin view - latest message per quote)
  listConversations: adminQuery.query(async () => {
    const db = getDb();
    // Get latest message for each quoteId
    const allMessages = await db.select().from(quoteMessages).orderBy(desc(quoteMessages.createdAt));

    // Group by quoteId
    const grouped = new Map<string, typeof allMessages[0][]>();
    for (const msg of allMessages) {
      if (!grouped.has(msg.quoteId)) grouped.set(msg.quoteId, []);
      grouped.get(msg.quoteId)!.push(msg);
    }

    // Get quote details for each conversation
    const conversations = [];
    for (const [quoteId, messages] of grouped) {
      const quote = await db.select().from(quotes).where(eq(quotes.quoteId, quoteId)).limit(1);
      if (quote.length) {
        const unreadCount = messages.filter(m => m.read === "0" && m.sender === "customer").length;
        conversations.push({
          quoteId,
          quoteName: quote[0].name,
          quoteEmail: quote[0].email,
          quoteStatus: quote[0].status,
          latestMessage: messages[0],
          messageCount: messages.length,
          unreadCount,
          updatedAt: messages[0].createdAt,
        });
      }
    }
    return conversations.sort((a: { updatedAt: Date }, b: { updatedAt: Date }) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }),

  // Mark as read
  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(quoteMessages).set({ read: "1" }).where(eq(quoteMessages.id, input.id));
      return { success: true };
    }),

  // Get unread count for admin
  unreadCount: adminQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(quoteMessages)
      .where(and(eq(quoteMessages.sender, "customer"), eq(quoteMessages.read, "0")));
    return Number(result[0].count);
  }),
});
