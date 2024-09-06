import { KeyvPostgresOptions } from "@keyv/postgres/dist/types";
import crypto from "crypto";
import { Cookie, createCookie, createSessionStorage } from "@remix-run/node"; // or cloudflare/deno
import Keyv from "keyv";
import { sessionCookie } from "./cookies";

function createDatabaseSessionStorage({ cookie }: { cookie: Cookie }) {
  // Configure your database client...
  const db = new Keyv<KeyvPostgresOptions>({
    adapter: "postgres",
    uri: process.env.DATABASE_URL,
  });

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      // `expires` is a Date after which the data should be considered
      // invalid. You could use it to invalidate the data somehow or
      // automatically purge this record from your database.
      const randomBytes = crypto.randomBytes(8);
      const id = randomBytes.toString("hex");
      await db.set(id, data, expires?.getTime());
      return id;
    },
    async readData(id) {
      return (await db.get(id)) || null;
    },
    async updateData(id, data, expires) {
      await db.set(id, data, expires?.getTime());
    },
    async deleteData(id) {
      await db.delete(id);
    },
  });
}

export const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage({
    cookie: sessionCookie,
  });
