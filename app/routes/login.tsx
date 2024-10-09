import {
  LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Id, toast } from "react-toastify";
import { LoginCookie } from "~/types";
import {
  Turnstile,
  TurnstileServerValidationResponse,
} from "@marsidev/react-turnstile";
import { Session } from "~/.server/sessions";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Login to forum" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await Session;
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (token) {
    return redirect("/");
  }

  return {};
}

export default function Login() {
  const [passwordData, setPasswordData] = useState({
    type: "password",
    placeholder: "*********",
  });
  const loading = React.useRef<Id | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const togglePassword = () => {
    setPasswordData((prevType) => {
      if (prevType.type === "password") {
        return { type: "text", placeholder: "youseeme" };
      } else {
        return { type: "password", placeholder: "*********" };
      }
    });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const login = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const formData = new FormData(formRef.current!);
    const token = formData.get("cf-turnstile-response");

    const res = await fetch("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "content-type": "application/json",
      },
    });

    const data = (await res.json()) as TurnstileServerValidationResponse;

    if (data.success) {
      if (!login.value && password.value) {
        return toast.error("Please fill in the username or email field", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: false,
          closeOnClick: true,
          theme: "dark",
          toastId: "emptyUsername",
        });
      } else if (!password.value && login.value) {
        return toast.error("Please fill in the password field", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: false,
          closeOnClick: true,
          theme: "dark",
          toastId: "emptyPassword",
        });
      } else if (!login.value && !password.value) {
        return toast.error(
          "Please fill in the username or email and password field",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            pauseOnHover: false,
            closeOnClick: true,
            theme: "dark",
            toastId: "emptyUsernamePassword",
          }
        );
      }

      const promise = new Promise<LoginCookie | never>(
        async (resolve, reject) => {
          const res = await fetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({
              login: login.value,
              password: password.value,
            }),
          });
          const data = await res.json();
          if (data.code === 401) {
            reject(data);
          }
          if (data.code === 200) {
            resolve(data);
          }
        }
      );

      await toast.promise(promise, {
        pending: {
          render() {
            return "Mencoba login...";
          },
          pauseOnHover: false,
          theme: "dark",
          toastId: "loadingLogin",
        },
        success: {
          render(res) {
            // document.cookie = res.data.cookies[0];
            window.localStorage.setItem("token", res.data.token);
            window.location.href = "/";
            return "Login berhasil. Mengalihkan ke halaman utama...";
          },
          type: "success",
          pauseOnHover: false,
          theme: "dark",
          toastId: "successLogin",
          closeOnClick: true,
        },
        error: {
          render(opt) {
            const { data } = opt as any;
            return `Login gagal: ${data.message}`;
          },
          type: "error",
          pauseOnHover: false,
          theme: "dark",
          toastId: "errorLogin",
          closeOnClick: true,
        },
      });
    } else {
      return toast.error(
        "Tolong selesaikan verifikasi bahwa anda bukan robot",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: false,
          closeOnClick: true,
          theme: "dark",
          toastId: "verifyFailed",
        }
      );
    }
  };

  return (
    <div className="bg-[#141f47] flex items-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <form
          className="bg-[#202c5e] shadow-md rounded px-8 pt-6 pb-8 mb-4 text-slate-200"
          ref={formRef}
          onSubmit={handleLogin}
        >
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="username">
              Username or Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username or Email"
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
              id="password"
              type={passwordData.type}
              placeholder="*********"
            />
            <div className="absolute top-8 bottom-2 right-0 pr-3 flex items-center leading-5">
              <FontAwesomeIcon
                icon={passwordData.type === "password" ? faEye : faEyeSlash}
                className={`cursor-pointer text-gray-700 transition ease-${
                  passwordData.type === "password" ? "out" : "in"
                } duration-300 select-none`}
                id="togglePassword"
                onClick={togglePassword}
                width={24}
                height={24}
              ></FontAwesomeIcon>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Turnstile
              siteKey="0x4AAAAAAAvV9Dwxni70xFRs"
              options={{
                language: "id",
              }}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
