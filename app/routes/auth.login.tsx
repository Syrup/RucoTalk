import { json, type ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { jwtDecode } from "jwt-decode";
import { DB } from "~/.server/db.server";
import { login as loginCookie } from "~/.server/cookies";
import { v4 as uuidv4 } from "uuid";
import { Session } from "~/.server/sessions";
import { generateTokens } from "~/.server/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      const cookieHeader = request.headers.get("Cookie");
      const cookie = (await loginCookie.parse(cookieHeader)) ?? {
        isLoggedIn: false,
      };
      const { getSession, commitSession, destroySession } = await Session;
      const session = await getSession(cookieHeader);
      const headers = new Headers();
      const data = await request.json();
      const { login, password } = data;
      // const url = process.env.FORU_MS_URL;
      const db = new DB();

      try {
        let isEmail = /\S+@\S+\.\S+/.test(login);
        let user = isEmail
          ? await db.getUser({ email: login })
          : await db.getUser({ username: login });

        if (!user) {
          return json(
            {
              status: "error",
              code: 401,
              message: "Account not found",
            },
            401
          );
        }

        if (
          !(await db.verifyPassword({ username: user.username!, password }))
        ) {
          return json(
            {
              status: "error",
              code: 401,
              message: "Invalid password",
            },
            401
          );
        }

        cookie.isLoggedIn = true;
        const { accessToken, refreshToken } = generateTokens(user, uuidv4());

        session.set("token", accessToken);

        cookie.user = user;
        cookie.expired = jwtDecode(accessToken).exp;

        headers.append("Set-Cookie", await loginCookie.serialize(cookie));
        headers.append(
          "Set-Cookie",
          await commitSession(session, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          })
        );

        // headers.append("Authorization", `Bearer ${accessToken}`);

        return json(
          {
            status: "success",
            code: 200,
            message: "Login success",
            data: user,
            token: accessToken,
            refreshToken,
          },
          {
            status: 200,
            headers,
          }
        );
      } catch (err) {
        console.error(err);
        return json(
          { status: "error", code: 500, message: (err as Error).message },
          500
        );
      }

      //#region REMOVED
      // try {
      //   const res = await fetch(`/auth/login`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Accept: "application/json",
      //       "x-api-key": process.env.FORU_MS_API_KEY!,
      //     },
      //     body: JSON.stringify({ login, password }),
      //   });
      //   const jsonData = await res.json();

      //   if (jsonData.message === "Invalid credentials") {
      //     return json(
      //       {
      //         status: "error",
      //         code: 401,
      //         message: "Username or password is incorrect",
      //       },
      //       401
      //     );
      //   }

      //   cookie.isLoggedIn = true;
      //   cookie.expired = jwtDecode(jsonData.token).exp;
      //   session.set("token", jsonData.token);

      //   const userData = await fetch(`${url}/auth/me`, {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${jsonData.token}`,
      //       "x-api-key": process.env.FORU_MS_API_KEY!,
      //     },
      //   });

      //   const user = await userData.json();

      //   cookie.user = user;
      //   // cookie.token = jsonData.token;

      //   headers.append("Set-Cookie", await loginCookie.serialize(cookie));
      //   headers.append(
      //     "Set-Cookie",
      //     await commitSession(session, {
      //       expires: new Date(cookie.expired * 1000),
      //     })
      //   );

      //   return json(
      //     {
      //       status: "success",
      //       code: 200,
      //       message: "Login success",
      //       data: user,
      //       token: jsonData.token,
      //     },
      //     {
      //       status: 200,
      //       headers,
      //     }
      //   );
      // } catch (err) {
      //   console.error(err);
      //   return json(
      //     { status: "error", code: 500, message: (err as Error).message },
      //     500
      //   );
      // }
      //#endregion
    }
    case "PUT": {
      /* handle "PUT" */
    }
    case "PATCH": {
      /* handle "PATCH" */
    }
    case "DELETE": {
      /* handle "DELETE" */
    }
  }
};
