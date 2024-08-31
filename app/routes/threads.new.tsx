import React, { useRef, useState } from "react";
import { getFileTypeIcon } from "~/lib/getFIleTypeIcon.tsx";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  ActionFunction,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

import { Form } from "@remix-run/react";
import FancyArea from "~/components/fancy-area";

export const action: ActionFunction = async ({ request }) => {
  const fileUploadHandler = await unstable_createFileUploadHandler({
    avoidFileConflicts: true,
    directory: "./uploads",
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    fileUploadHandler
  );

  console.log(formData.getAll("image"));

  return null;
};

const ThreadsNew = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
        className="w-full max-w-md md:mr-4 overflow-y-auto max-h-[80vh]"
        encType="multipart/form-data"
      >
        <fieldset className="border border-muted p-3">
          <legend className="text-xl font-bold text-center">
            Create New Thread
          </legend>
          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={handleTitleChange}
            className="mt-4"
            name="title"
          />
          <FancyArea
            textAreaName="content"
            textAreaPlaceholder="Curahkan isi hatimu..."
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
