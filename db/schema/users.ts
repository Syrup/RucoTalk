import { varchar, pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import crypto from "crypto";

function randomString(length: number) {
  return crypto.randomBytes(length).toString("hex");
}

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  username: varchar("username").default("Anonymous " + randomString(4)),
  created_at: timestamp("createdAt").defaultNow(),
  updated_at: timestamp("updatedAt").defaultNow(),
});
