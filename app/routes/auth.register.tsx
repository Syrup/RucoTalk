import { ActionFunctionArgs, json } from "@remix-run/node";
import { Account, ID, Query, Users } from "node-appwrite";
import { adminClient } from "~/lib/.server/appwrite";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST": {
      const { username, email, password } = (await request.json()) as {
        username: string;
        email: string;
        password: string;
      };
      const users = new Users(adminClient);
      const account = new Account(adminClient);

      try {
        const checkUser = await users.list([Query.contains("email", email)]);

        console.log(checkUser);

        if (checkUser.total > 0) {
          throw new Error("Akun sudah ada.");
        }

        await account.create(ID.unique(), email, password, username);

        // await db.createUser({ username, email, password });

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
