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
// import { Session } from "./lib/.server/sessions";
import { login } from "./lib/.server/cookies";
import { LoginCookie } from "./types";
import { Account, Client } from "appwrite";
import { getSession } from "./lib/.server/sessions";

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
  const session = await getSession(cookieHeader);

  try {
    const sessionClient = new Client();

    sessionClient
      .setProject("67176ba8001fcd33e841")
      .setSession(await session.get("secret"));

    const account = new Account(sessionClient);

    const user = await account.get();

    return {
      isLoggedIn: user ? true : false,
      user,
    };
  } catch (error) {
    return {
      isLoggedIn: false,
      user: null,
    };
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  "use server";
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;
  //   if (isTokenExpired(token)) {
  //     localStorage.removeItem("token");
  //     navigate("/login");
  //   }
  // }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar user={data.isLoggedIn ? data.user : null} />
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
