import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";
import { tokens, users } from "db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { PgInsertValue } from "drizzle-orm/pg-core";
import { EventEmitter } from "node:events";
import { User } from "~/types";
import { Thread } from "~/types/Thread";
import { threads } from "db/schema/threads";

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  password: z.string(),
  username: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

const tokenSchema = z.object({
  id: z.string().uuid(),
  token: z.string(),
  user_id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

const tablesSchema = z.union([userSchema, tokenSchema]);

type Tables = typeof users | typeof tokens;

const saltRounds = parseInt(process.env.SALT_ROUNDS!);

const sql = neon(process.env.DATABASE_URL!);

// neonConfig.webSocketConstructor = ws;
// neonConfig.fetchConnectionCache = true;

class DB extends EventEmitter {
  public db: ReturnType<typeof drizzle>;

  constructor() {
    super();

    this.db = drizzle(sql);
  }

  async insert<T extends Tables>(table: T, data: PgInsertValue<T>) {
    if (table !== users && table !== tokens) {
      throw new DBError("Invalid table");
    }

    return await this.db.insert(table).values(data);
  }

  async delete<T extends Tables>(table: T, id: string) {
    if (table !== users && table !== tokens) {
      throw new DBError("Invalid table");
    }

    if (typeof id !== "string") {
      throw new DBError("Invalid id");
    }

    if (!id) {
      throw new DBError("Id is required");
    }

    let check = await this.db.select().from(table).where(eq(table.id, id));

    if (check.length === 0) {
      throw new DBError("Id not found");
    }

    return await this.db.delete(table).where(eq(table.id, id));
  }

  async getUser({ username, email }: { username?: string; email?: string }) {
    if (email) {
      const user = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (user.length === 0) {
        throw new DBError("User not found");
      }

      return user[0] as User;
    } else if (username) {
      const user = await this.db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (user.length === 0) {
        throw new DBError("User not found");
      }

      return user[0] as User;
    } else {
      return null;
    }
  }

  async createUser({
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

    return await this.db
      .insert(users)
      .values({ username, email, password: hashPassword });
  }

  async verifyPassword({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    const user = await this.getUser({ username });
    if (!user) return false;
    return bcrypt.compare(password, user.password);
  }

  async newThread({
    author,
    thread,
  }: {
    author: User;
    thread: Omit<Thread, "authorId" | "id">;
  }) {
    const user = await this.getUser({ username: author.username! });

    console.log(thread.attachments);

    if (!user) {
      throw new DBError("User not found");
    }

    return await this.db.insert(threads).values({
      ...thread,
      authorId: user.id,
    });
  }

  async getThread(id: string) {
    const thread = await this.db
      .select()
      .from(threads)
      .where(eq(threads.id, id));

    if (thread.length === 0) {
      throw new DBError("Thread not found");
    }

    return thread[0] as Thread;
  }
}

class DBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { DB, DBError };
