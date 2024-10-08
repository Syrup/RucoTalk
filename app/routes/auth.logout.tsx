import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { login } from "~/.server/cookies";
import { Session } from "~/.server/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) ?? {
    isLoggedIn: false,
  };
  const headers = new Headers();

  const { getSession, commitSession, destroySession } = await Session;
  const session = await getSession(cookieHeader);

  await destroySession(session);

  headers.append("Set-Cookie", "__session=; Max-Age=0; Path=/; HttpOnly");
  headers.append("Set-Cookie", "__login=; Max-Age=0; Path=/; HttpOnly");
  return redirect("/", {
    headers,
  });
}
