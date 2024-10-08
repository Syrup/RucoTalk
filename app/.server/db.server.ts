import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { tokens, users } from "db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { PgInsertValue } from "drizzle-orm/pg-core";
import { EventEmitter } from "node:events";
import { User } from "~/types";
import { Thread, ThreadComment } from "~/types/Thread";
import { threads } from "db/schema/threads";
import { client } from "./redis";
import { v4 } from "uuid";

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

const saltRounds = 10;

// neonConfig.webSocketConstructor = ws;
// neonConfig.fetchConnectionCache = true;

class DB extends EventEmitter {
  public db: ReturnType<typeof drizzle>;
  public pool: Pool;
  public redis: typeof client;

  constructor() {
    super();
    // const sql = neon(process.env.DATABASE_URL!);
    neonConfig.webSocketConstructor = ws;
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });

    this.db = drizzle(this.pool);
    this.redis = client;
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

  async getUsers({ limit = 10 }: { limit?: number } = {}) {
    return await this.db.select().from(users).limit(limit);
  }

  async getUser({
    username,
    email,
    id,
  }: {
    username?: string;
    email?: string;
    id?: string;
  }) {
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
    } else if (id) {
      const user = await this.db.select().from(users).where(eq(users.id, id));

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
    console.log(user);
    return bcrypt.compare(password, user.password);
  }

  async newThread({
    author,
    thread,
  }: {
    author: User;
    thread: Omit<Thread, "authorId" | "id" | "status" | "comments">;
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

  async setUserStatus({
    id,
    status,
  }: {
    id: string;
    status: "online" | "offline";
  }) {
    return await this.redis.set(`user:${id}:status`, status);
  }

  async close() {
    console.log("Closing redis connection");
    await this.redis.quit();
    console.log("Closing db connection");
    return this.pool.end();
  }

  async addComment({
    id,
    data,
  }: {
    id: string;
    data: Omit<ThreadComment, "id" | "createdAt">;
  }) {
    const thread = await this.getThread(id);
    if (!id) {
      throw new DBError("Thread id is required");
    }

    if (!data) {
      throw new DBError("Data is required");
    }

    return await this.db
      .update(threads)
      .set({
        comments: [
          ...thread.comments,
          {
            ...data,
            id: v4(),
            createdAt: new Date(),
          },
        ],
      })
      .where(eq(threads.id, id));
  }

  async isAdmin(user: User | string) {
    if (typeof user === "string") {
      const u = await this.getUser({ id: user });

      return u?.roles?.includes("admin");
    }

    return user.roles?.includes("admin");
  }
}

class DBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { DB, DBError };
