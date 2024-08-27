import React, { useRef, useState } from "react";
// import { Textarea, Button, Input } from 'your-ui-library'; // Replace 'your-ui-library' with the actual UI library you are using
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import {
  faFileAudio,
  faFileLines,
  faFilePdf,
  faFileText,
  faFileVideo,
} from "@fortawesome/free-solid-svg-icons";
import { Badge } from "~/components/ui/badge";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
  ActionFunction,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form } from "@remix-run/react";

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
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);


  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFile((prevFiles) => [...prevFiles, ...newFiles] as File[]);

    const dataTransfer
  };

  const handleImageChange = (e: HTMLInputElement) => {
    const newImages = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...newImages] as File[]);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = file.filter((_, i) => i !== index);
    setFile(updatedFiles);
  };

  const handleDeleteImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const getFileTypeIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <Icon icon={faFilePdf}></Icon>; // PDF icon
      case "doc":
      case "docx":
        return <Icon icon={faFileText}></Icon>; // Word document icon
      case "mp4":
        return <Icon icon={faFileVideo}></Icon>; // Video icon
      case "mp3":
        return <Icon icon={faFileAudio}></Icon>; // Audio icon
      default:
        return <Icon icon={faFileLines}></Icon>; // Default file icon
    }
  };

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
          <Textarea
            placeholder="Content"
            value={content}
            onChange={handleContentChange}
            className="mt-4 mb-4"
            name="content"
          />
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
            {images.map((image, index) => (
              <div key={index} className="relative w-full mt-3">
                <img
                  src={URL.createObjectURL(image as Blob)}
                  alt=""
                  className="w-full"
                />
                <button
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-0 right-0 text-muted hover:bg-muted/50 animate-in animate-out rounded-full p-1 m-1"
                >
                  <X />
                </button>
              </div>
            ))}
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
