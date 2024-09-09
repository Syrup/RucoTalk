import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const tokens = pgTable("RefreshToken", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  hashedToken: varchar("hashedToken").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
