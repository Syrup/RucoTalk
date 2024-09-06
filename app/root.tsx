import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
 useNavigate } from "@remix-run/react";
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
import { LinksFunction, LoaderFunction } from "@remix-run/node";
import Navbar from "~/components/ui/navbar";

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

export const loader: LoaderFunction = async ({ request, response }) => {
  const url = request.url.split("?")[0];
  const pathname = url.split("/")[3];
  console.log(pathname);
  return pathname;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const data = useLoaderData<string>();

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
        <Navbar />
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
