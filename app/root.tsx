import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import styles from "./tailwind.css?url";
import "react-toastify/dist/ReactToastify.min.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faEye,
  faEyeSlash,
  faFileAudio,
  faFileImage,
  faFileLines,
  faFilePdf,
  faFileText,
  faFileVideo,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import {
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import Navbar from "~/components/ui/navbar";
import { Session } from "./.server/sessions";
import { login } from "./.server/cookies";
import { LoginCookie } from "./types";
import { client } from "./.server/redis";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

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

library.add(
  faEye,
  faEyeSlash,
  faFilePdf,
  faFileImage,
  faFileAudio,
  faFileText,
  faFileVideo,
  faFileLines
);

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie:
    | LoginCookie
    | {
        isLoggedIn: false;
      } = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };
  if (!cookie.isLoggedIn) {
    return {
      cookie,
    };
  }

  Object.assign(cookie, { isLoggedIn: isTokenExpired(cookie.token) });

  return {
    cookie,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  "use server";
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar user={data.cookie.isLoggedIn ? data.cookie : null} />
        <ToastContainer />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
