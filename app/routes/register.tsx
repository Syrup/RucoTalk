import {
  LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Session } from "~/.server/sessions";

export const meta: MetaFunction = () => {
  return [
    { title: "Register" },
    { name: "description", content: "Register for the forum" },
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

export default function Register() {
  const [passwordData, setPasswordData] = useState({
    type: "password",
    placeholder: "*********",
  });

  const togglePassword = () => {
    setPasswordData((prevType) => {
      if (prevType.type === "password") {
        return { type: "text", placeholder: "youseeme" };
      } else {
        return { type: "password", placeholder: "*********" };
      }
    });
  };

  const handleRegister = async () => {
    // Handle register logic here
    const username = document.getElementById("username") as HTMLInputElement;
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    if (!username.value || !email.value || !password.value) {
      return toast.error("Please fill in all fields", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        pauseOnHover: false,
        closeOnClick: true,
        theme: "dark",
        toastId: "emptyFields",
      });
    }

    const promise = new Promise<{
      status: string;
      code: number;
      message: string;
    }>(async (resolve, reject) => {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        resolve(data);
      } else {
        reject(data);
      }
    });

    await toast.promise(promise, {
      pending: {
        render() {
          return "Registering...";
        },
        pauseOnHover: false,
        theme: "dark",
        toastId: "loadingRegister",
      },
      success: {
        render(res) {
          window.location.href = "/login";
          return "Register successful. Redirecting to login page...";
        },
        type: "success",
        pauseOnHover: false,
        theme: "dark",
        toastId: "successRegister",
        closeOnClick: true,
      },
      error: {
        render(opt) {
          const { data } = opt as any;
          return `Register failed: ${data.message}`;
        },
        type: "error",
        pauseOnHover: false,
        theme: "dark",
        toastId: "errorRegister",
        closeOnClick: true,
      },
    });
  };

  return (
    <div className="bg-[#141f47] flex items-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <form className="bg-[#202c5e] shadow-md rounded px-8 pt-6 pb-8 mb-4 text-slate-200">
          <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
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
              placeholder={passwordData.placeholder}
            />
            <div className="absolute top-8 bottom-2 right-0 pr-3 flex items-center leading-5">
              <FontAwesomeIcon
                icon={passwordData.type === "password" ? faEye : faEyeSlash}
                className={`cursor-pointer text-gray-700 transition ease-${
                  passwordData.type === "password" ? "out" : "in"
                } duration-300 select-none text-sm`}
                id="togglePassword"
                onClick={togglePassword}
                width={24}
                height={24}
              ></FontAwesomeIcon>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="button"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
