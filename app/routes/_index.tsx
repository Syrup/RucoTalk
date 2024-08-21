import {
  json,
  redirect,
  type ActionFunction,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { jwtDecode } from "jwt-decode";
import { login } from "~/cookies.server";
import type { User } from "types";
import { getSession } from "~/sessions.server";

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

// export const meta: MetaFunction = () => {
//   return [
//     { title: "New Remix App" },
//     { name: "description", content: "Welcome to Remix!" },
//   ];
// };

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };
  const session = await getSession(cookieHeader);

  return json({
    isLoggedIn: !isTokenExpired(session.get("token")),
    user: cookie.user,
    expired: cookie.expired,
  });
};

// export const action: ActionFunction = async ({ request }) => {
//   const cookieHeader = request.headers.get("Cookie");
//   const cookie = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };

//   if (!cookie.isLoggedIn) {
//     cookie.isLoggedIn = false;
//   }

//   return redirect("/login", {
//     headers: {
//       "Set-Cookie": await login.serialize(cookie),
//     },
//   });
// };

// function Logged() {
//   const user = useLoaderData<{ user: User }>().user;

//   return (
//     <div className="font-sans p-4">
//       <h1 className="text-3xl">Welcome back, {user.username}</h1>
//       <p className="mt-4">
//         You are logged in. You can now access the{" "}
//         <a
//           className="text-blue-700 underline visited:text-purple-900"
//           href="/dashboard"
//         >
//           dashboard
//         </a>
//         .
//       </p>
//     </div>
//   );
// }

// function NotLogged() {
//   return (
//     <div className="font-sans p-4">
//       <h1 className="text-3xl">Welcome to Remix</h1>
//       <ul className="list-disc mt-4 pl-6 space-y-2">
//         <li>
//           <a
//             className="text-blue-700 underline visited:text-purple-900"
//             target="_blank"
//             href="https://remix.run/start/quickstart"
//             rel="noreferrer"
//           >
//             5m Quick Start
//           </a>
//         </li>
//         <li>
//           <a
//             className="text-blue-700 underline visited:text-purple-900"
//             target="_blank"
//             href="https://remix.run/start/tutorial"
//             rel="noreferrer"
//           >
//             30m Tutorial
//           </a>
//         </li>
//         <li>
//           <a
//             className="text-blue-700 underline visited:text-purple-900"
//             target="_blank"
//             href="https://remix.run/docs"
//             rel="noreferrer"
//           >
//             Remix Docs
//           </a>
//         </li>
//       </ul>
//     </div>
//   );
// }

// export default function Index() {
//   const data = useLoaderData<{
//     isLoggedIn: boolean;
//     user: User;
//     expired: number;
//   }>();
//   return data.isLoggedIn ? <Logged /> : <NotLogged />;
// }

import React from "react";

export default function Index() {
  return (
    <div className="bg-[#131f47] flex flex-row justify-center w-full">
      <div className="bg-[#131f47] overflow-hidden w-[960px] h-[768px] relative">
        <div className="absolute w-[1188px] h-[1039px] top-[156px] left-[-62px]">
          <div className="absolute w-[1188px] h-[695px] top-[344px] left-0">
            <div className="absolute w-[1117px] h-[424px] top-[135px] left-9 bg-[#16434d] rotate-[-14.79deg]" />
            <p className="absolute w-[422px] top-[243px] left-[89px] [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
              *dikhususkan kepada siswa/siswi smk texmaco semarang
            </p>
          </div>
          <div className="absolute w-[963px] h-[479px] top-0 left-[75px]">
            <div className="absolute w-[15px] h-[15px] top-[22px] left-[407px] border-b-2 [border-bottom-style:solid] border-l-2 [border-left-style:solid] border-[#6d6969] -rotate-45" />
            <div className="absolute w-[251px] h-[29px] top-[13px] left-[23px]">
              <div className="relative h-[31px] -top-px -left-px rounded border border-solid border-[#6d6969]">
                <div className="absolute top-0 left-[83px] [font-family:'DM_Sans-Regular',Helvetica] font-normal text-[#9a9494] text-[21px] tracking-[0] leading-[normal]">
                  Search
                </div>
                <img
                  className="absolute w-[25px] h-[25px] top-0.5 left-1"
                  alt="Search"
                  src="search.svg"
                />
              </div>
            </div>
            <div className="absolute w-[934px] h-[478px] top-0 left-0 rounded-[28px] border border-solid border-[#4e4e4e]" />
            <img
              className="absolute w-px h-[478px] top-px left-[772px]"
              alt="Vector"
              src="vector-1.svg"
            />
            <img
              className="absolute w-[771px] h-[3px] top-48 left-px"
              alt="Vector"
              src="vector-2-2.svg"
            />
            <img
              className="absolute w-[771px] h-[3px] top-72 left-px"
              alt="Vector"
              src="vector-3-3.svg"
            />
            <img
              className="absolute w-[771px] h-[3px] top-[379px] left-px"
              alt="Vector"
              src="vector-4.svg"
            />
            <div className="absolute w-[181px] h-[445px] top-[19px] left-[782px]">
              <div className="absolute top-0 left-0.5 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[21px] tracking-[0] leading-[normal]">
                Recent posts
              </div>
              <div className="absolute w-16 h-[30px] top-[67px] left-0.5">
                <div className="absolute w-16 top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] text-[19px] tracking-[0] leading-[normal]">
                  Author
                </div>
                <div className="absolute w-16 top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] text-[19px] tracking-[0] leading-[normal]">
                  Author
                </div>
              </div>
              <div className="absolute w-[141px] h-6 top-[98px] left-0">
                <div className="absolute w-[141px] top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                  This is short desc....
                </div>
                <div className="absolute w-[141px] top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                  This is short desc....
                </div>
              </div>
              <div className="absolute w-16 h-[25px] top-[137px] left-0.5">
                <div className="top-0 left-0 text-[19px] absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                  Author
                </div>
                <div className="top-0 left-0 text-[19px] absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                  Author
                </div>
              </div>
              <div className="absolute w-[141px] h-5 top-[163px] left-0">
                <div className="top-0 left-0 absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                  This is short desc....
                </div>
                <div className="top-0 left-0 absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                  This is short desc....
                </div>
              </div>
              <div className="absolute w-16 h-[30px] top-[198px] left-0.5">
                <div className="absolute w-16 top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] text-[19px] tracking-[0] leading-[normal]">
                  Author
                </div>
                <div className="absolute w-16 top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] text-[19px] tracking-[0] leading-[normal]">
                  Author
                </div>
              </div>
              <div className="absolute w-[141px] h-6 top-[229px] left-0">
                <div className="absolute w-[141px] top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                  This is short desc....
                </div>
                <div className="absolute w-[141px] top-0 left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                  This is short desc....
                </div>
              </div>
              <div className="top-[268px] left-0.5 text-[19px] absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                Author
              </div>
              <div className="top-[294px] left-0 absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                This is short desc....
              </div>
              <div className="w-16 top-[329px] left-1 text-[19px] absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                Author
              </div>
              <div className="w-[141px] top-[360px] left-0.5 absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                This is short desc....
              </div>
              <div className="top-[399px] left-1 text-[19px] absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                Author
              </div>
              <div className="top-[425px] left-0.5 absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                This is short desc....
              </div>
            </div>
            <div className="absolute w-[147px] h-11 top-3 left-[287px] rounded-[var(--shape-corner-extra-small)] border border-solid border-[#6d6969]" />
            <div className="absolute top-[18px] left-[318px] [font-family:'DM_Sans-Regular',Helvetica] font-normal text-[#9a9494] text-[21px] tracking-[0] leading-[normal]">
              Threads
            </div>
            <div className="absolute w-[183px] h-[35px] top-[11px] left-[575px]">
              <div className="relative w-[181px] h-[35px] bg-[#1483c1] rounded-[5px]">
                <div className="absolute w-[163px] top-2 left-[9px] [font-family:'Inter-Regular',Helvetica] font-normal text-white text-base tracking-[0] leading-[normal]">
                  Create a new Thread
                </div>
              </div>
            </div>
            <div className="absolute w-[745px] h-[82px] top-[105px] left-3.5">
              <p className="absolute top-[62px] left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                This is long description blablaablalablabal
              </p>
              <div className="absolute top-[39px] left-[63px] [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#ffffff96] text-xs tracking-[0] leading-[normal]">
                11-05-2024 17:58
              </div>
              <img
                className="absolute w-px h-3 top-[42px] left-14"
                alt="Vector"
                src="image.svg"
              />
              <div className="top-[39px] left-[9px] text-xs absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                Author
              </div>
              <div className="absolute top-0 left-0 [font-family:'Inter-Regular',Helvetica] font-normal text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                Title
              </div>
              <div className="absolute w-[7px] h-[7px] top-[18px] left-[730px] bg-[#9a9494] rounded-[3.5px]" />
              <div className="absolute w-[7px] h-[7px] top-[27px] left-[730px] bg-[#9a9494] rounded-[3.5px]" />
            </div>
            <div className="absolute w-[745px] h-[82px] top-[293px] left-3.5">
              <p className="absolute top-[62px] left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                This is long description blablaablalablabal
              </p>
              <div className="absolute top-[39px] left-[63px] [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#ffffff96] text-xs tracking-[0] leading-[normal]">
                11-05-2024 17:58
              </div>
              <img
                className="absolute w-px h-3 top-[42px] left-14"
                alt="Vector"
                src="vector-2.svg"
              />
              <div className="top-[39px] left-[9px] text-xs absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                Author
              </div>
              <div className="absolute top-0 left-0 [font-family:'Inter-Regular',Helvetica] font-normal text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                Title
              </div>
              <div className="absolute w-[7px] h-[7px] top-[18px] left-[730px] bg-[#9a9494] rounded-[3.5px]" />
              <div className="absolute w-[7px] h-[7px] top-[27px] left-[730px] bg-[#9a9494] rounded-[3.5px]" />
            </div>
            <div className="absolute w-[745px] h-[82px] top-[199px] left-3.5">
              <p className="absolute top-[62px] left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                This is long description blablaablalablabal
              </p>
              <div className="absolute top-[39px] left-[63px] [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#ffffff96] text-xs tracking-[0] leading-[normal]">
                11-05-2024 17:58
              </div>
              <img
                className="absolute w-px h-3 top-[42px] left-14"
                alt="Vector"
                src="vector-3-2.svg"
              />
              <div className="top-[39px] left-[9px] text-xs absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                Author
              </div>
              <p className="absolute top-0 left-0 [font-family:'Inter-Regular',Helvetica] font-normal text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                Title is really long her...
              </p>
              <div className="absolute w-[7px] h-[7px] top-2.5 left-[730px] bg-[#9a9494] rounded-[3.5px]" />
              <div className="absolute w-[7px] h-[7px] top-[19px] left-[730px] bg-[#9a9494] rounded-[3.5px]" />
            </div>
            <div className="absolute w-[745px] h-[82px] top-[387px] left-3.5">
              <p className="absolute top-[62px] left-0 [font-family:'DM_Sans-Bold',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[normal]">
                This is long description blablaablalablabal
              </p>
              <div className="absolute top-[39px] left-[63px] [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#ffffff96] text-xs tracking-[0] leading-[normal]">
                11-05-2024 17:58
              </div>
              <img
                className="absolute w-px h-3 top-[42px] left-14"
                alt="Vector"
                src="vector-3.svg"
              />
              <div className="top-[39px] left-[9px] text-xs absolute [font-family:'DM_Sans-Bold',Helvetica] font-bold text-[#8a33fb] tracking-[0] leading-[normal]">
                Author
              </div>
              <p className="absolute top-0 left-0 [font-family:'Inter-Regular',Helvetica] font-normal text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                Title is really long her...
              </p>
              <div className="absolute w-[7px] h-[7px] top-2.5 left-[730px] bg-[#9a9494] rounded-[3.5px]" />
              <div className="absolute w-[7px] h-[7px] top-[19px] left-[730px] bg-[#9a9494] rounded-[3.5px]" />
            </div>
          </div>
        </div>
        <div className="absolute w-[217px] h-[65px] top-1 left-[732px] rounded-[7px] border border-solid border-[#ffffff1f]">
          <img
            className="absolute w-[52px] h-[52px] top-[5px] left-[15px]"
            alt="Ellipse"
            src="ellipse-1.svg"
          />
          <div className="absolute w-[15px] h-[15px] top-[21px] left-[184px] border-b-2 [border-bottom-style:solid] border-l-2 [border-left-style:solid] border-white -rotate-45" />
          <div className="absolute top-[15px] left-[78px] [font-family:'DM_Serif_Display-Regular',Helvetica] font-normal text-white text-[21px] tracking-[0] leading-[normal]">
            Username
          </div>
        </div>
        <div className="absolute w-[241px] h-[78px] top-0 left-0 bg-[url(/image.png)] bg-[100%_100%]">
          <img
            className="absolute w-60 h-[73px] top-0 left-0"
            alt="Group"
            src="group-19.png"
          />
        </div>
      </div>
    </div>
  );
}
