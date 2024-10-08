import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { threads } from "db/schema/threads";
import { DB } from "~/.server/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const db = new DB();
  switch (request.method) {
    case "POST":
      const db = new DB();
      const formData = await request.formData();
      const id = formData.get("id") as string;
      const content = formData.get("content") as string;
      const authorId = formData.get("authorId") as string;
      const authorName = formData.get("authorName") as string;

      if (!id || !content) {
        return json(
          {
            status: "error",
            code: 400,
            message: "Bad request",
          },
          400
        );
      }

      const comment = {
        content,
        authorId: authorId,
        authorName,
        isAdmin: (await db.isAdmin(authorId)) ? true : false,
      };

      await db.addComment({ id, data: comment });
      console.log(formData);

      // return redirect(`/threads/${id}`);
      return json(
        {
          status: "success",
          code: 200,
          message: "Comment added successfully",
        },
        200
      );
  }
}
