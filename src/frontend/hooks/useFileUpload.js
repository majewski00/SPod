import { useState, useRef, useCallback, useEffect } from "react";
import { initializeUpload } from "../services/upload";
import { useFolderContext } from "../contexts/FolderContext";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export function useFileUpload(onUploadComplete) {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [uploadController, setUploadController] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const fileInputRef = useRef(null);
  const newUploadsQueueRef = useRef([]);

  const { currentFolder } = useFolderContext();

  const debouncedReload = useCallback(
    debounce(() => {
      if (onUploadComplete) {
        onUploadComplete();
      }
    }, 300),
    [onUploadComplete]
  );

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
        result: {},
      }));

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

    const controller = initializeUpload(
      uploadQueue,
      (fileId, progress, status, result) => {
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId
              ? {
                  ...item,
                  progress,
                  ...(status !== undefined && { status }),
                  ...(result !== undefined && { result }),
                }
              : item
          )
        );
      },
      (fileId, result) => {
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId
              ? { ...item, status: "complete", progress: 100, result }
              : item
          )
        );
        debouncedReload();
      },
      (fileId, error) => {
        console.log("OnItemError:", error, fileId);
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.id === fileId
              ? { ...item, status: "error", error: error.message, progress: -1 }
              : item
          )
        );
      },
      { parentId: currentFolder.id, itemLocation: currentFolder.path }
    );

    setUploadController(controller);
  }, [uploadQueue]);

  useEffect(() => {
    startUpload();
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

  const cancelUpload = useCallback(
    (clearCompleted = false) => {
      if (uploadController) {
        uploadController.cancel();
        setUploadController(null);
      }

      if (clearCompleted) {
        setUploadQueue((prevQueue) =>
          prevQueue.filter(
            (item) => item.progress !== 100 && item.progress !== -1
          )
        );
      } else {
        setUploadQueue([]);
      }
    },
    [uploadController]
  );

  useEffect(() => {
    if (uploadQueue.length === 0 || !uploadController) return;

    const intervalId = setInterval(() => {
      const status = uploadController.getStatus();
      setIsPaused(status.isPaused);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [uploadQueue.length, uploadController]);

  return {
    uploadQueue,
    errors,
    isSelecting,
    isPaused,
    openFileSelector,
    pauseUpload,
    resumeUpload,
    cancelUpload,
  };
}
