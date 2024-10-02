import {
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  TypedResponse,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { DB } from "~/.server/db.server";
import { Textarea } from "~/components/ui/textarea";
import type { Thread } from "~/types/Thread";
import ReactMarkdown from "react-markdown";
import { getFileTypeIcon } from "~/lib/getFIleTypeIcon";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<
  | TypedResponse<Thread>
  | TypedResponse<{ status: string; code: number; message: string }>
> {
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

  return json(thread, 200);
}

interface ThreadProps {
  id: string;
  title: string;
  content: string;
}

export default function Thread({ id, title, content }: ThreadProps) {
  const data = useLoaderData<typeof loader>() as Thread;

  return (
    <div>
      <h1 className="font-koulen block bg-slate-500 max-w-52 text-4xl my-4 mr-4">
        {data.title}
      </h1>
      <div className="p-2">
        <div className="border-2 border-muted border-solid rounded-md p-4 m-auto">
          <label htmlFor="pesan">Pesan: </label>

          <ReactMarkdown>{data.content}</ReactMarkdown>
          <br />

          {/* here is attachments */}
          <span>Attachments:</span>
          <div className="flex flex-wrap gap-4">
            {data.attachments.map((attachment) => {
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
        </div>
        <Separator className="my-4" />
      </div>
      <div className="mt-6 max-w-[29%] m-2">
        <form className="flex flex-col space-y-4">
          <Textarea
            placeholder="Leave a comment"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
          <Button
            type="submit"
            className="self-start px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
          >
            Comment
          </Button>
        </form>
      </div>
    </div>
  );
}
