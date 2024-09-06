import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";
import { users } from "db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

const saltRounds = parseInt(process.env.SALT_ROUNDS!);

const sql = neon(process.env.DATABASE_URL!);

neonConfig.webSocketConstructor = ws;

export const db = drizzle(sql);

export async function createUser({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashPassword = await bcrypt.hash(password, salt);

  return await db
    .insert(users)
    .values({ username, email, password: hashPassword });
}

export async function verifyPassword({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const user = (
    await db
      .select({ username: users.username, password: users.password })
      .from(users)
      .where(eq(users.username, username))
  ).at(0);
  if (!user) return false;
  return bcrypt.compare(password, user.password);
}

export async function getUser({
  username,
  email,
}: {
  username?: string;
  email?: string;
}) {
  if (email) {
    return await db.select().from(users).where(eq(users.email, email));
  } else if (username) {
    return await db.select().from(users).where(eq(users.username, username));
  } else {
    return null;
  }
}
