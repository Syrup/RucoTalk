import {
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  TypedResponse,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { DB } from "~/.server/db";
import { Textarea } from "~/components/ui/textarea";
import type { Thread } from "~/types/Thread";
import ReactMarkdown from "react-markdown";

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

const Thread: React.FC<ThreadProps> = ({ id, title, content }) => {
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
                return (
                  //   <div key={attachment.name.split(".")[0]}>
                  //     <img
                  //       src={attachment.url}
                  //       alt={attachment.name}
                  //       className="w-1/2 h-1/2"
                  //     />
                  //   </div>
                  <div className="relative group">
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-1/2 h-1/2"
                    />
                    <div className="absolute top-0 left-0 w-1/2 bg-black bg-opacity-50 flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a className="text-white" href={attachment.url}>
                        {attachment.name}
                      </a>
                    </div>
                  </div>
                );
              } else {
                return (
                  <a
                    key={attachment.name.split(".")[0]}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {attachment.name}
                  </a>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thread;
