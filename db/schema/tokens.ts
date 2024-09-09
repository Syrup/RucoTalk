import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const tokens = pgTable("tokens", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  token: varchar("token").notNull().unique(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("createdAt").defaultNow(),
  updated_at: timestamp("updatedAt").defaultNow(),
});
