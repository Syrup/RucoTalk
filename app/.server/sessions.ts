import { KeyvPostgresOptions } from "@keyv/postgres/dist/types";
import crypto from "crypto";
import { Cookie, createCookie, createSessionStorage } from "@remix-run/node"; // or cloudflare/deno
import Keyv from "keyv";
import { sessionCookie } from "./cookies";
import { client } from "./redis";
import { createClient } from "redis";

async function createDatabaseSessionStorage({ cookie }: { cookie: Cookie }) {
  const client = createClient({
    url: process.env.REDIS_DB_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const randomBytes = crypto.randomBytes(8);
      const id = randomBytes.toString("hex");
      await client.hSet(`session:${id}`, data);
      if (expires) {
        await client.expireAt(`session:${id}`, expires.getTime());
      }
      return id;
    },
    async readData(id) {
      return (await client.hGetAll(`session:${id}`)) ?? null;
    },
    async updateData(id, data, expires) {
      await client.hSet(`session:${id}`, data);
      if (expires) {
        await client.expireAt(`session:${id}`, expires.getTime());
      }
    },
    async deleteData(id) {
      await client.del(`session:${id}`);
    },
  });
}

export const { getSession, commitSession, destroySession } =
  await createDatabaseSessionStorage({
    cookie: sessionCookie,
  });
