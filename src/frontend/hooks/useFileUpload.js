import { useState, useRef, useCallback } from "react";
import { initializeUpload } from "../services/upload";

/**
 * Custom hook for handling file uploads
 * @returns {Object} Object containing file selection and upload functionality
 */
export function useFileUpload() {
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [uploadController, setUploadController] = useState(null);
  const fileInputRef = useRef(null);

  const createFileInput = useCallback(() => {
    if (fileInputRef.current) {
      document.body.removeChild(fileInputRef.current);
    }

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.style.display = "none";
    document.body.appendChild(input);
    fileInputRef.current = input;

    input.addEventListener("change", handleFileSelection);
  }, []);

  const handleFileSelection = useCallback((event) => {
    setIsSelecting(false);

    try {
      const selectedFiles = Array.from(event.target.files);

      if (selectedFiles.length === 0) {
        return;
      }

      // todo remove logs
      console.log(
        "Selected files:",
        selectedFiles.map((file) => file.name)
      );
      console.log("File object:", selectedFiles[0]);

      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
      setUploadQueue((prevQueue) => [
        ...prevQueue,
        ...selectedFiles.map((file) => ({
          file,
          progress: 0,
          status: "pending",
          id: `${file.name}-${Date.now()}`, // TODO: maybe assign ID here and now (instead of backend)
        })),
      ]);
    } catch (error) {
      console.error("Error selecting files:", error);
      setErrors((prevErrors) => [
        ...prevErrors,
        {
          message: "Failed to select files",
          details: error.message,
          timestamp: new Date(),
        },
      ]);
    }

    if (fileInputRef.current) {
      document.body.removeChild(fileInputRef.current);
      fileInputRef.current = null;
    }
  }, []);

  const openFileSelector = useCallback(() => {
    setIsSelecting(true);
    createFileInput();
    fileInputRef.current.click();
  }, [createFileInput]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setUploadQueue([]);
  }, []);

  const startUpload = useCallback(() => {
    if (uploadQueue.length === 0) {
      console.warn("No files to upload");
      return;
    }
    const controller = initializeUpload(
      () => uploadQueue,
      (fileId, progress, status = "uploading") => {
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId ? { ...item, progress, status } : item
          )
        );
      },
      // TODO: should add result field to the item (?)
      (fileId, result) => {
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId ? { ...item, status: "complete" } : item
          )
        );
      },
      (fileId, error) => {
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId
              ? { ...item, status: "error", error: error.message }
              : item
          )
        );
      }
    );

    setUploadController(controller);
  }, [uploadQueue]);

  const pauseUpload = useCallback(() => {
    if (uploadController) {
      uploadController.pause();
    }
  }, [uploadController]);

  const resumeUpload = useCallback(() => {
    if (uploadController) {
      uploadController.resume();
    }
  }, [uploadController]);

  const cancelUpload = useCallback(() => {
    if (uploadController) {
      uploadController.cancel();
      setUploadController(null);
    }
  }, [uploadController]);

  return {
    files,
    uploadQueue,
    errors,
    isSelecting,
    openFileSelector,
    clearErrors,
    clearFiles,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
  };
}
