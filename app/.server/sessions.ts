import { KeyvPostgresOptions } from "@keyv/postgres/dist/types";
import crypto from "crypto";
import { Cookie, createCookie, createSessionStorage } from "@remix-run/node"; // or cloudflare/deno
import Keyv from "keyv";
import { sessionCookie } from "./cookies";
import { client } from "./redis";
import { createClient } from "redis";

async function createDatabaseSessionStorage({ cookie }: { cookie: Cookie }) {
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
      console.log(await client.hGetAll(`session:${id}`), id);
      const data = (await client.hGetAll(`session:${id}`)) ?? null;
      return data;
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

export const Session = createDatabaseSessionStorage({
  cookie: sessionCookie,
});
