import { useState, useRef, useCallback, useEffect } from "react";
import { initializeUpload } from "../services/upload";
import { useFolderContext } from "../contexts/FolderContext";

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
  const newUploadsQueueRef = useRef([]);

  const { currentFolder } = useFolderContext();

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

      const newQueueItems = selectedFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending",
        id: `${file.name}-${Date.now()}`,
      }));

      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
      setUploadQueue((prevQueue) => [...prevQueue, ...newQueueItems]);
      newUploadsQueueRef.current = newQueueItems;
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

  const startUpload = useCallback(() => {
    const filesToUpload = newUploadsQueueRef.current;
    newUploadsQueueRef.current = [];

    if (filesToUpload.length === 0) return;

    console.log("Starting upload for files:", filesToUpload);
    console.log("Upload queue state:", uploadQueue);

    const controller = initializeUpload(
      uploadQueue,
      (fileId, progress, status = "uploading") => {
        console.log("onItemProgress:", fileId, progress, status);
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId ? { ...item, progress, status } : item
          )
        );
      },
      // TODO: should add result field to the item (?)
      (fileId, result) => {
        console.log("onItemComplete:", result, fileId);
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId
              ? { ...item, status: "complete", progress: "100" }
              : item
          )
        );
      },
      (fileId, error) => {
        console.log("OnItemError:", error, fileId);
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId
              ? { ...item, status: "error", error: error.message }
              : item
          )
        );
      },
      { parentId: currentFolder.id, itemLocation: currentFolder.path }
    );

    setUploadController(controller);
  }, [uploadQueue]);

  useEffect(() => {
    console.log("Upload queue changed:", uploadQueue);
    startUpload();
  }, [uploadQueue]);

  return {
    files,
    uploadQueue,
    errors,
    isSelecting,
    openFileSelector,
    startUpload,
  };
}

//   const pauseUpload = useCallback(() => {
//   if (uploadController) {
//     uploadController.pause();
//   }
// }, [uploadController]);

// const resumeUpload = useCallback(() => {
//   if (uploadController) {
//     uploadController.resume();
//   }
// }, [uploadController]);

// const cancelUpload = useCallback(() => {
//   if (uploadController) {
//     uploadController.cancel();
//     setUploadController(null);
//   }
// }, [uploadController]);

//   pauseUpload,
//   resumeUpload,
//   cancelUpload,
// clearErrors,
// clearFiles,

// const clearErrors = useCallback(() => {
//   setErrors([]);
// }, []);

// const clearFiles = useCallback(() => {
//   setFiles([]);
//   setUploadQueue([]);
// }, []);
