import {
  json,
  LoaderFunctionArgs,
  redirect,
  TypedResponse,
  type ActionFunction,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { jwtDecode } from "jwt-decode";
import { login } from "~/.server/cookies";
import type { LoginCookie, User } from "~/types";
import { Session } from "~/.server/sessions";
import { Button } from "~/components/ui/button";
import { mail } from "~/.server/utils";
import { client } from "~/.server/redis";

const isTokenExpired = (token: string) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp! < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const meta: MetaFunction = () => {
  return [
    { title: "RucoTalk: Ceritakan Masalahmu" },
    { name: "description", content: "Ceritakan masalahmu disini!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs): Promise<
  TypedResponse<{
    isLoggedIn: boolean;
    user: User;
    cookie: LoginCookie;
    expired: number;
  }>
> {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };
  const { getSession } = await Session;
  const session = await getSession(cookieHeader);

  // mail.sendMail({
  //   from: '"PIK R" <pik.r@sxrup.xyz>',
  //   to: "goodgamersz665@gmail.com",
  //   subject: "Hello",
  //   text: "Hello world?",
  //   html: "<b>Hello world?</b>",
  // });

  // console.log(cookie);

  return json({
    isLoggedIn: !isTokenExpired(session.get("token")),
    user: cookie.user,
    cookie,
    expired: cookie.expired,
  });
}

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };

  if (!cookie.isLoggedIn) {
    cookie.isLoggedIn = false;
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await login.serialize(cookie),
    },
  });
};

function Logged() {
  const { user, cookie } = useLoaderData<typeof loader>();

  return (
    <div className="p-4 font-sans">
      <h1 className="text-3xl">Welcome back, {user.username}</h1>
      <p className="mt-4">
        You are logged in. You can now access the{" "}
        <a
          className="text-blue-700 underline visited:text-purple-900"
          href="/dashboard"
        >
          dashboard
        </a>
        .
      </p>
    </div>
  );
}

function NotLogged() {
  return (
    <div className="p-4 font-sans">
      <Button>Click me!</Button>
      <h1 className="text-3xl">Welcome to Remix</h1>
      <ul className="pl-6 mt-4 space-y-2 list-disc">
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/quickstart"
            rel="noreferrer"
          >
            5m Quick Start
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/tutorial"
            rel="noreferrer"
          >
            30m Tutorial
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/docs"
            rel="noreferrer"
          >
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}

export default function Index() {
  const data = useLoaderData<{
    isLoggedIn: boolean;
    user: User;
    expired: number;
  }>();
  return data.isLoggedIn ? <Logged /> : <NotLogged />;
}
