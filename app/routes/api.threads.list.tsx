import { json, LoaderFunctionArgs } from "@remix-run/node";
import { threads } from "db/schema/threads";
import { DB } from "~/.server/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const db = new DB();
  switch (request.method) {
    case "GET":
      const threadsList = await db.db.select().from(threads);

      if (
        request.headers.get("Authorization") !==
        `Bearer ${process.env.REFRESH_SECRET}`
      ) {
        return json({ message: "Unauthorized" }, 401);
      }

      return json(threadsList, 200);
  }
}
