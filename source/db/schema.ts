import { mysqlTable, serial, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  season: varchar("season", { length: 20 }),
  description: text("description"),
  image: varchar("image", { length: 500 }).notNull(),
  badge: varchar("badge", { length: 20 }),
  sizes: varchar("sizes", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quotes = mysqlTable("quotes", {
  id: serial("id").primaryKey(),
  quoteId: varchar("quoteId", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  productType: varchar("productType", { length: 100 }),
  quantity: varchar("quantity", { length: 50 }),
  fabric: varchar("fabric", { length: 255 }),
  sizeRange: varchar("sizeRange", { length: 100 }),
  deadline: varchar("deadline", { length: 50 }),
  requirements: text("requirements"),
  designFiles: text("designFiles"),
  productRef: varchar("productRef", { length: 255 }),
  status: mysqlEnum("status", ["new", "processing", "quoted", "accepted", "declined"]).default("new"),
  adminNotes: text("adminNotes"),
  quotePrice: varchar("quotePrice", { length: 100 }),
  quoteTimeline: varchar("quoteTimeline", { length: 100 }),
  quoteMou: varchar("quoteMou", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const quoteMessages = mysqlTable("quote_messages", {
  id: serial("id").primaryKey(),
  quoteId: varchar("quoteId", { length: 20 }).notNull(),
  sender: mysqlEnum("sender", ["customer", "admin"]).notNull(),
  senderName: varchar("senderName", { length: 255 }),
  message: text("message").notNull(),
  read: mysqlEnum("read", ["0", "1"]).default("0").notNull(),
  readByCustomer: mysqlEnum("readByCustomer", ["0", "1"]).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const subadmins = mysqlTable("subadmins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  password: varchar("password", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved"]).default("pending").notNull(),
  permissions: varchar("permissions", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
