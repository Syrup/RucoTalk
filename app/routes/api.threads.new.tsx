import { ActionFunctionArgs, json } from "@remix-run/node";
import { v4 } from "uuid";
import { DB } from "~/.server/db.server";
import { LoginCookie } from "~/types";
import { Attachment } from "~/types/Thread";
import { login } from "~/.server/cookies";
import * as fs from "fs";

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie: LoginCookie = (await login.parse(cookieHeader)) ?? {
    isLoggedIn: false,
  };
  const form = await request.formData();

  try {
    const filePromises = form.getAll("file").map(async (file) => {
      if (file instanceof File) {
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: file.type });
        return { name: file.name, blob };
      }
      return null;
    });

    const imagePromises = form.getAll("image").map(async (file) => {
      if (file instanceof File) {
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: file.type });
        return { name: file.name, blob };
      }
      return null;
    });

    const attachments: Attachment[] = [];
    const filesWithBlobs = await Promise.all([
      ...filePromises,
      ...imagePromises,
    ]);

    await Promise.all(
      filesWithBlobs.map(async (file) => {
        const url = new URL(request.url);
        const extension = /\.[0-9a-z]+$/i.exec(file?.name!)![0];
        const name = v4() + extension;

        if (file) {
          fs.writeFileSync(
            `./uploads/${name}`,
            new Uint8Array(await file.blob.arrayBuffer())
          );
        }

        attachments.push({
          name,
          url: `/files/${name}`,
          type: file?.blob.type!,
        });
      })
    );

    const db = new DB();

    await db.newThread({
      author: cookie.user,
      thread: {
        title: form.get("title") as string,
        content: form.get("content") as string,
        attachments,
      },
    });

    const thread = await db.getThread({
      title: form.get("title") as string,
    });

    return json(
      {
        threadId: thread?.id,
        status: "success",
        code: 200,
      },
      200
    );
  } catch (e) {
    return json(
      {
        status: "error",
        message: "Failed to create thread",
        code: 500,
      },
      500
    );
  }
}
