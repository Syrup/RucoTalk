import { ActionFunctionArgs, json } from "@remix-run/node";
import { DB } from "~/.server/db.server";
import { mail } from "~/.server/utils";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST":
      const db = new DB();
      const formData = await request.formData();
      const id = formData.get("id") as string;
      const content = formData.get("content") as string;
      const authorId = formData.get("authorId") as string;
      const authorName = formData.get("authorName") as string;
      const thread = await db.getThread({ id });
      const user = await db.getUser({ id: thread?.authorId });

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

      console.log(user?.email, authorName, thread?.title);

      mail.sendMail({
        from: '"PIK R" <pik.r@sxrup.xyz>',
        to: user?.email!,
        subject: `${authorName} berkomentar di thread ${thread?.title}`,
        html: `<p><pre>${authorName}</pre> berkomentar di thread <pre>${thread?.title}</pre></p>
        <blockquote>"${content}"</blockquote>
        <a href="https://ruco-talk.vercel.app/threads/${id}">Lihat thread</a>
        `,
      });

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
