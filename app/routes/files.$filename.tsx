import { LoaderFunction } from "@remix-run/node";
import * as fs from "fs";
import * as path from "path";

export const loader: LoaderFunction = async ({ params }) => {
  const filename = params.filename;

  if (!filename) {
    return new Response("Filename not provided", {
      status: 400,
    });
  }

  // return console.log(filename);

  // Prevent path traversal attacks
  if (filename.includes("..")) {
    return new Response("Invalid filename", {
      status: 400,
    });
  }

  // Prevent path traversal attacks
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), "uploads", safeFilename);

  try {
    // Check if the file exists
    await fs.promises.access(filePath, fs.constants.F_OK);

    const file = await fs.promises.readFile(filePath);

    if (file.length === 0) {
      return new Response("File not found", {
        status: 404,
      });
    }

    return new Response(file, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    // Handle errors (e.g., file not found, permission issues)
    return new Response("Error reading file", {
      status: 500,
    });
  }
};
