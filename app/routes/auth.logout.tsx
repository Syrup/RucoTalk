import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Client } from "appwrite";
import { Account } from "appwrite";
import { adminClient } from "~/lib/.server/appwrite";
import { login } from "~/lib/.server/cookies";
import { destroySession, getSession } from "~/lib/.server/sessions";
// import { Session } from "~/lib/.server/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const headers = new Headers();

  const session = await getSession(cookieHeader);

  const sessionClient = new Client();
  sessionClient
    .setProject("67176ba8001fcd33e841")
    .setSession(await session.get("secret"));

  const account = new Account(sessionClient);

  await account.deleteSession("current");

  await destroySession(session);

  headers.append("Set-Cookie", "__session=; Max-Age=0; Path=/; HttpOnly");
  headers.append("Set-Cookie", "__login=; Max-Age=0; Path=/; HttpOnly");
  return redirect("/", {
    headers,
  });
}
