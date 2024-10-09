import { ActionFunctionArgs, json } from "@remix-run/node";
import { DB } from "~/.server/db.server";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST": {
      const db = new DB();
      const { createUser, getUser } = db;
      const { username, email, password } = (await request.json()) as {
        username: string;
        email: string;
        password: string;
      };

      try {
        const checkUser = await db.getUser({ email: email });

        if (checkUser !== null) {
          throw new Error("Akun sudah ada.");
        }

        await db.createUser({ username, email, password });

        return json(
          {
            status: "success",
            code: 200,
            message: "User successfully created",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            status: 201,
          }
        );
      } catch (error) {
        if (
          (error as any).message ===
          "Email is already in use. Please use another email."
        ) {
          return json(
            {
              status: "error",
              code: 409,
              message: "Email is already in use. Please use another email.",
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              status: 409,
            }
          );
        }

        console.error("Error creating user:", error);

        return json(
          {
            status: "error",
            code: 500,
            message: "Error creating user: " + (error as any).message,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            status: 500,
          }
        );
      }
    }
  }
}
