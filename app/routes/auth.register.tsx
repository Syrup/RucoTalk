import { ActionFunctionArgs, json } from "@remix-run/node";
import { createUser, getUser } from "~/.server/utils";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST": {
      const { username, email, password } = (await request.json()) as {
        username: string;
        email: string;
        password: string;
      };

      try {
        const checkUser = await getUser({ email: email });

        if (checkUser && checkUser.length > 0) {
          throw new Error("Email is already in use. Please use another email.");
        }

        await createUser({ username, email, password });

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
