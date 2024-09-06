import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Textarea } from "~/components/ui/textarea";

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id;

  return json(
    {
      id,
      title: `Thread ${id}`,
      content: `This is the content for thread ${id}`,
    },
    200
  );
};

interface ThreadProps {
  id: string;
  title: string;
  content: string;
}

const Thread: React.FC<ThreadProps> = ({ id, title, content }) => {
  const data = useLoaderData<ThreadProps>();
  return (
    <div>
      <h1 className="font-koulen block bg-slate-500 max-w-52 text-4xl my-4 mr-4 p-1">
        {data.title}
      </h1>
      <div className="border-2 border-muted border-solid rounded-md p-4 m-auto">
        <label htmlFor="pesan">Pesan: </label>
        <Textarea
          id="pesan"
          className="w-full"
          value={data.content}
          readOnly
        ></Textarea>
      </div>
    </div>
  );
};

export default Thread;
