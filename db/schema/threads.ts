import {
  varchar,
  text,
  timestamp,
  pgTable,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const threads = pgTable("threads", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  attachments: jsonb("attachments").array().default([]),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
