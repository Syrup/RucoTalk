import React from "react";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFileText,
  faFileVideo,
  faFileAudio,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

export const getFileTypeIcon = (fileName: string) => {
  const extension = fileName.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || "";
  switch (extension) {
    case "pdf":
      return <Icon icon={faFilePdf} />; // PDF icon
    case "doc":
    case "docx":
      return <Icon icon={faFileText} />; // Word document icon
    case "mp4":
      return <Icon icon={faFileVideo} />; // Video icon
    case "mp3":
      return <Icon icon={faFileAudio} />; // Audio icon
    default:
      return <Icon icon={faFileLines} />; // Default file icon
  }
};
