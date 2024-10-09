import React, { useRef, useState } from "react";
import { getFileTypeIcon } from "~/lib/getFIleTypeIcon.tsx";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import FancyArea from "~/components/fancy-area";
import { Session } from "~/.server/sessions";
import { toast } from "react-toastify";
import {
  Turnstile,
  TurnstileServerValidationResponse,
} from "@marsidev/react-turnstile";

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await Session;
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) {
    return redirect("/login");
  }

  return {};
}

const ThreadsNew = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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

      // Update the file input's files property
      const fileInput = e.target;
      fileInput.files = dataTransfer.files;

      return updatedFiles;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const token = (
      document.querySelector(
        'input[name="cf-turnstile-response"]'
      ) as HTMLInputElement
    ).value;

    const res = await fetch("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "content-type": "application/json",
      },
    });

    const data = (await res.json()) as TurnstileServerValidationResponse;

    if (data.success) {
      if (!title || !content) {
        return toast.error("Judul dan konten tidak boleh kosong", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: false,
          closeOnClick: true,
          theme: "dark",
          toastId: "emptyFields",
        });
      }

      const promise = new Promise<{
        status: string;
        code: number;
        message: string;
        threadId: string;
      }>(async (resolve, reject) => {
        try {
          const res = await fetch("/api/threads/new", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          console.log(data);

          if (data.code === 200) {
            resolve(data);
          } else {
            reject(data);
          }
        } catch (e) {
          reject({
            status: "error",
            code: 500,
            message: (e as any).message,
          });
        }
      });

      await toast.promise(promise, {
        pending: {
          render() {
            return "Membuat thread...";
          },
          pauseOnHover: false,
          theme: "dark",
          toastId: "loadingThread",
        },
        success: {
          render(res) {
            return (
              <div>
                <p>Thread berhasil dibuat</p>
                <a href={`/threads/${res.data.threadId}`}>Lihat thread</a>
              </div>
            );
          },
          type: "success",
          pauseOnHover: false,
          theme: "dark",
          toastId: "successThread",
          closeOnClick: true,
        },
        error: {
          render(opt) {
            const { data } = opt as any;
            return `Error: ${data.message}`;
          },
          type: "error",
          pauseOnHover: false,
          theme: "dark",
          toastId: "errorThread",
          closeOnClick: true,
        },
      });
    } else {
      return toast.error(
        "Tolong selesaikan verifikasi bahwa anda bukan robot",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: false,
          closeOnClick: true,
          theme: "dark",
          toastId: "verifyFailed",
        }
      );
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
          <Turnstile
            siteKey="0x4AAAAAAAvV9Dwxni70xFRs"
            options={{
              language: "id",
            }}
          />
          <Button className="mt-4" type="submit">
            Submit
          </Button>
        </fieldset>
      </Form>
    </div>
  );
};

export default ThreadsNew;
