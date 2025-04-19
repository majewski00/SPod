import React from "react";
import {
  Description,
  Image,
  PictureAsPdf,
  AudioFile,
  VideoFile,
  Code,
  Archive,
  InsertDriveFile,
  TextSnippet,
  TableView,
} from "@mui/icons-material";

/**
 * Maps file extensions to appropriate MUI icons
 * @param {string} fileType - The file extension or MIME type
 * @returns {React.ReactElement} - The appropriate MUI icon component
 */
export const getFileTypeIcon = (fileType) => {
  // Extract extension from filename if full filename is provided
  let extension = fileType;
  if (fileType && fileType.includes(".")) {
    extension = fileType.split(".").pop().toLowerCase();
  } else if (fileType && fileType.includes("/")) {
    // Handle MIME types
    extension = fileType.split("/")[1].toLowerCase();
  }

  // Map extensions to icons
  switch (extension) {
    // Images
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
    case "webp":
      return <Image />;

    // Documents
    case "pdf":
      return <PictureAsPdf />;
    case "doc":
    case "docx":
    case "odt":
    case "rtf":
      return <Description />;
    case "txt":
    case "md":
      return <TextSnippet />;

    // Spreadsheets
    case "xls":
    case "xlsx":
    case "csv":
      return <TableView />;

    // Code
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
    case "json":
    case "xml":
    case "py":
    case "java":
    case "c":
    case "cpp":
    case "php":
      return <Code />;

    // Audio
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
    case "flac":
      return <AudioFile />;

    // Video
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "mkv":
    case "webm":
      return <VideoFile />;

    // Archives
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <Archive />;

    // Default
    default:
      return <InsertDriveFile />;
  }
};

/**
 * Get the appropriate icon for a file
 * @param {File|string} file - The file object or filename
 * @returns {React.ReactElement} - The appropriate MUI icon component
 */
export const getIconForFile = (file) => {
  if (!file) return <InsertDriveFile />;

  if (typeof file === "string") {
    return getFileTypeIcon(file);
  }

  return getFileTypeIcon(file.type || file.name);
};
