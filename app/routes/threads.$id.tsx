import {
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
  TypedResponse,
} from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { DB } from "~/.server/db.server";
import { Textarea } from "~/components/ui/textarea";
import type { Thread } from "~/types/Thread";
import ReactMarkdown from "react-markdown";
import { getFileTypeIcon } from "~/lib/getFIleTypeIcon";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { LoginCookie } from "~/types";
import { login } from "~/.server/cookies";
import { toast } from "react-toastify";
import { Badge } from "~/components/ui/badge";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie:
    | LoginCookie
    | {
        isLoggedIn: false;
      } = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };

  const db = new DB();
  const id = params.id;

  if (!id) {
    return json(
      {
        status: "error",
        code: 400,
        message: "Bad request",
      },
      400
    );
  }

  const thread = await db.getThread(id);

  return json({
    thread,
    cookie,
  });
}

interface ThreadProps {
  id: string;
  title: string;
  content: string;
}

export default function Thread({ id, title, content }: ThreadProps) {
  const data = useLoaderData<typeof loader>();

  if ("status" in data) return <div>{data.message}</div>;

  const { cookie, thread } = data;

  const onComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    formData.append("authorId", cookie.isLoggedIn ? cookie.user.id : "0");
    formData.append("id", thread.id);
    formData.append(
      "authorName",
      cookie.isLoggedIn ? cookie.user.username! : "Unknown"
    );

    const promise = new Promise<{
      status: "success" | "error";
      code: number;
      message: string;
    }>(async (resolve, reject) => {
      const res = await fetch(`/api/threads/${thread.id}/comments`, {
        method: "POST",
        body: formData,
      });

      // console.log("Response: ", res.text());

      const data: {
        code: number;
        message: string;
        status: "success" | "error";
      } = await res.json().catch((err) => {
        reject(err);
        return err;
      });

      console.log("Data: ", data);
      resolve(data);
      if (data.code === 400) {
        reject(data);
      }
      if (data.code === 200) {
        resolve(data);
      }
    });

    await toast.promise(promise, {
      pending: {
        render() {
          return "Posting comment...";
        },
        pauseOnHover: false,
        theme: "dark",
        toastId: "loadingComment",
      },
      success: {
        render(res) {
          window.location.reload();
          return "Comment added successfully";
        },
        type: "success",
        pauseOnHover: false,
        theme: "dark",
        toastId: "successComment",
        closeOnClick: true,
      },
      error: {
        render(opt) {
          const { data } = opt as any;
          return `Comment failed: ${data.message}`;
        },
        type: "error",
        pauseOnHover: false,
        theme: "dark",
        toastId: "errorComment",
        closeOnClick: true,
      },
    });
  };

  return (
    <div>
      <h1 className="font-koulen m-4 text-4xl ">{thread.title}</h1>
      <div className="p-2">
        <div className="border-2 border-muted border-solid rounded-md p-4 m-auto">
          <label htmlFor="pesan">Pesan: </label>

          <ReactMarkdown>{thread.content}</ReactMarkdown>
          <br />

          {/* here is attachments */}
          {thread.attachments.length === 0 ? <span>No attachments</span> : null}
          {thread.attachments.length > 0 ? (
            <>
              <span>Attachments:</span>
              <div className="flex flex-wrap gap-4">
                {thread.attachments.map((attachment) => {
                  if (attachment.type === "image/png") {
                    const url = new URL(location.origin + attachment.url);

                    return (
                      <div className="relative group border">
                        <img
                          key={attachment.name.split(".")[0]}
                          src={url.href}
                          alt={attachment.name}
                          className="max-w-md max-h-md object-contain"
                        />
                        <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity animate-in ease-in-out animate-out duration-500">
                          <a
                            className="text-white w-full h-full  visited:text-purple-500"
                            href={attachment.url}
                          >
                            {attachment.name}
                          </a>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={attachment.name.split(".")[0]}
                        className="relative w-[29%] mt-3 flex items-center border-muted px-2 rounded border mb-4 hover:border-primary/50 focus-within:border-primary/50"
                      >
                        <span className="mr-2">
                          {getFileTypeIcon(attachment.name)}
                        </span>
                        <a
                          key={attachment.name.split(".")[0]}
                          href={attachment.url}
                          target="_blank"
                          className="visited:text-purple-500"
                          rel="noreferrer"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    );
                  }
                })}
              </div>
            </>
          ) : null}
        </div>
        <Separator className="my-4" />
      </div>
      <div className="m-4 mt-6">
        <h2 className="text-2xl font-semibold">Comments</h2>
        {thread.comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul className="my-4">
            {thread.comments.map((comment) => (
              <>
                <li key={comment.id} className="pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">
                      {comment.authorName ?? "Unknown"}{" "}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(comment.createdAt!).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="ml-3">
                      {comment.isAdmin ? <Badge>Admin</Badge> : null}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </li>
                <Separator className="w-2/6" />
              </>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 max-w-[29%] m-2">
        <Form
          className="flex flex-col space-y-4"
          method="POST"
          onSubmit={onComment}
          encType="application/x-www-form-urlencoded"
        >
          <Textarea
            placeholder="Leave a comment"
            name="content"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
          <Button
            type="submit"
            className="self-start px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
            disabled={!cookie.isLoggedIn}
          >
            Comment
          </Button>
        </Form>
      </div>
    </div>
  );
}
