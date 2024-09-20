import React, { useRef, useState } from "react";
import { getFileTypeIcon } from "~/lib/getFIleTypeIcon.tsx";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  ActionFunction,
  LoaderFunction,
  LoaderFunctionArgs,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
  json,
  SerializeFrom,
  TypedResponse,
} from "@remix-run/node";
import fs from "fs";

import { Form, useLoaderData } from "@remix-run/react";
import FancyArea from "~/components/fancy-area";
import { DB } from "~/.server/db";
import { login } from "~/.server/cookies";
import { LoginCookie, User } from "~/types";
import { getSession } from "~/.server/sessions";
import { Attachment } from "~/types/Thread";
import { v4 } from "uuid";

export const action: ActionFunction = async ({ request, context }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie: LoginCookie = (await login.parse(cookieHeader)) ?? {
    isLoggedIn: false,
  };
  const session = await getSession(cookieHeader);
  const form = await request.formData();

  console.log("Form", form);

  // if (
  //   request.headers.get("Authorization") !== `Bearer ${session.get("token")}`
  // ) {
  //   return new Response("Unauthorized", {
  //     status: 401,
  //   });
  // }

  console.log("here");

  try {
    // console.log("Request", request);
    // const formData = await request.formData();

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
    console.log("Files with Blobs", filesWithBlobs);

    await Promise.all(
      filesWithBlobs.map(async (file) => {
        const url = new URL(request.url);
        const extension = /\.[0-9a-z]+$/i.exec(file?.name!)![0];
        const name = v4() + extension;
        console.log("Name", name);

        if (file) {
          fs.writeFileSync(
            `./uploads/${name}`,
            new Uint8Array(await file.blob.arrayBuffer())
          );
        }

        attachments.push({
          name,
          url: `${url.origin}/files/${name}`,
          type: file?.blob.type!,
        });

        console.log("Attachments 1", attachments);
      })
    );

    console.log("Attachments", attachments);
    console.log("Form", form);
    // console.log("Form ", form);
    console.log("Files", form.getAll("file"));

    // console.log("Form", form.get("title"), form.get("content"));

    const db = new DB();

    await db.newThread({
      author: cookie.user,
      thread: {
        title: form.get("title") as string,
        content: form.get("content") as string,
        attachments,
      },
    });

    return new Response("Files uploaded", {
      status: 200,
    });
  } catch (e) {
    console.log(e);

    return new Response("Failed to upload files", {
      status: 500,
    });
  }
};

const ThreadsNew = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  console.log(images, file);
  console.log(fileInputRef, imageInputRef);
  // const { user, token } = useLoaderData<typeof loader>();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(fileInputRef.current?.files as FileList);
    setFile((prevFiles) => {
      const updatedFiles =
        prevFiles.length === 0 ? [...newFiles] : [...prevFiles, ...newFiles];

      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => {
        dataTransfer.items.add(file);
      });

      console.log(dataTransfer.files, updatedFiles);

      // Update the file input's files property
      const fileInput = e.target;
      fileInput.files = dataTransfer.files;

      return updatedFiles;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
    const newImages = Array.from(e.target.files as FileList);

    setImages((prevImages) => {
      const updatedImages =
        prevImages.length === 0
          ? [...newImages]
          : [...prevImages, ...newImages];

      return updatedImages;
    });
  };

  const handleDeleteFile = (index: number) => {
    const updatedFiles = file.filter((_, i) => i !== index);
    setFile(updatedFiles);

    // Update the file input's files property
    const fileInput = fileInputRef.current;
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => {
        dataTransfer.items.add(file);
      });
      fileInput.files = dataTransfer.files;
    }
  };

  const handleDeleteImage = (index: number, imageUrl: string) => {
    URL.revokeObjectURL(imageUrl);

    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);

    // Update the image input's files property
    const imageInput = imageInputRef.current;
    if (imageInput) {
      const dataTransfer = new DataTransfer();
      updatedImages.forEach((file) => {
        dataTransfer.items.add(file);
      });
      imageInput.files = dataTransfer.files;
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    file.forEach((file) => {
      formData.append("file", file);
    });
    images.forEach((image) => {
      formData.append("image", image);
    });
    const res = await fetch("/threads/new", {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token}`,
        // "Content-Type": "multipart/form-data",
      },
      body: formData,
    });
    if (res.ok) {
      console.log("Thread created");
    } else {
      console.log("Failed to create thread");
    }
  };

  // Cleanup function to revoke object URLs
  React.useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(URL.createObjectURL(image));
      });
    };
  }, [images]);

  return (
    <div className="flex items-center justify-center max-h-screen mt-5">
      <Form
        method="POST"
        action="/threads/new"
        className="w-full max-w-md md:mr-4 overflow-y-auto max-h-[80vh]"
        encType="multipart/form-data"
        onSubmit={submitHandler}
      >
        <fieldset className="border border-muted p-3">
          <legend className="text-xl font-bold text-center">
            Create New Thread
          </legend>
          <Input
            type="text"
            placeholder="Judul"
            value={title}
            onChange={handleTitleChange}
            className="mt-4"
            name="title"
          />
          <FancyArea
            textAreaName="content"
            textAreaPlaceholder="Curahkan isi hatimu..."
            textAreaOnChange={handleContentChange}
          ></FancyArea>
          <label htmlFor="uplfile" className="mt-4 cursor-pointer w-fit mr-5">
            <Button
              className="border border-muted text-white rounded-sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("uplfile")?.click();
              }}
            >
              Upload Files
            </Button>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.mp4,.mp3"
              id="uplfile"
              onChange={handleFileChange}
              className="hidden"
              name="file"
              ref={fileInputRef}
              multiple
            />
          </label>
          {file.length === 0 ? (
            ""
          ) : (
            <Badge variant="outline">
              {file.length} file{file.length > 1 ? "s" : ""} selected
            </Badge>
          )}
          <div className="mt-4">
            {file.map((file, index) => (
              <div
                key={index}
                className="relative w-full mt-3 flex items-center border-muted p-2 rounded border mb-4 hover:border-primary/50 focus-within:border-primary/50"
              >
                <span className="mr-2">{getFileTypeIcon(file.name)}</span>
                <span>{file.name}</span>
                <button
                  onClick={() => handleDeleteFile(index)}
                  className="absolute top-0 right-0 text-muted hover:bg-muted/50 animate-in animate-out rounded-full p-1 m-1"
                >
                  <X />
                </button>
              </div>
            ))}
          </div>
          <label htmlFor="uplimg" className="mt-4 cursor-pointer w-fit mr-5">
            <Button
              className="border border-muted text-white rounded-sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("uplimg")?.click();
              }}
            >
              Upload Images
            </Button>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden hover:bg-transparent"
              id="uplimg"
              ref={imageInputRef}
              name="image"
              multiple
            />
          </label>
          {images.length === 0 ? (
            ""
          ) : (
            <Badge variant="outline">
              {images.length} image{images.length > 1 ? "s" : ""} selected
            </Badge>
          )}
          <div className="mt-4">
            {images.map((image, index) => {
              const imageUrl = URL.createObjectURL(image as Blob);
              return (
                <div key={index} className="relative w-full mt-3">
                  <img src={imageUrl} alt="" className="w-full" />
                  <button
                    onClick={() => handleDeleteImage(index, imageUrl)}
                    className="absolute top-0 right-0 text-muted hover:bg-muted/50 animate-in animate-out rounded-full p-1 m-1"
                  >
                    <X />
                  </button>
                </div>
              );
            })}
          </div>
          <Button className="mt-4" type="submit">
            Submit
          </Button>
        </fieldset>
      </Form>
    </div>
  );
};

export default ThreadsNew;
