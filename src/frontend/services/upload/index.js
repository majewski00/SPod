import { generateThumbnail } from "./thumbnailService";
// import { encryptFile } from "./encryptionService";
import { calculateHash } from "./hashService";
import { uploadToS3 } from "./s3UploadService";
import { processQueue } from "./queueProcessor";

const processFile = async (file, onItemProgress, options) => {
  try {
    onItemProgress({ progress: 5, status: "uploading" });
    const thumbnail = await generateThumbnail(file);
    onItemProgress({ progress: 20, result: { thumbnailUrl: thumbnail?.url } });

    const fileHash = await calculateHash(file);
    onItemProgress({ progress: 40 });

    const fileId = await uploadToS3(
      file, // TODO Using the original file since we're not encrypting yet
      fileHash,
      "", // TODO No encrypted data key for now
      { ...options, hasThumbnail: !!thumbnail?.file }
    );
    onItemProgress({ progress: 70 });

    // Calculate hash for thumbnail if it exists
    let thumbnailHash = null;
    let thumbnailEncryptedFile = null;
    if (thumbnail?.file) {
      thumbnailHash = await calculateHash(thumbnail.file);
      onItemProgress({ progress: 80 });

      await uploadToS3(
        thumbnail.file,
        thumbnailHash,
        "", // TODO No encrypted data key for now
        { ...options, isThumbnail: true, fileId }
      );
      onItemProgress({ progress: 90, status: "verifying" });
    }

    // TODO: here we can wait for the confirmation of the upload: S3 -> trigger lambda -> update DB -> (here) wait for the status change (else) retry
    onItemProgress({ progress: 100, status: "complete" });

    return {
      success: true,
      fileId: fileId,
      thumbnailUrl: thumbnail?.url,
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      success: false,
      error: error.message,
      file: file.name,
    };
  }
};

/**
 * Processes a file with retry logic for transient errors
 * @param {File} file - The file object to process
 * @param {Function} onItemProgress - Callback for item progress updates
 * @param {Object} options - Upload options
 * @param {number} retries - Number of retries left
 * @returns {Promise<Object>} - Result of the upload process
 */
const processFileWithRetry = async (
  file,
  onItemProgress,
  options = {},
  retries = 3
) => {
  try {
    return await processFile(file, onItemProgress, options);
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)));
      return processFileWithRetry(file, options, retries - 1);
    }
    throw error;
  }
};

const isRetryableError = (error) => {
  // TODO: Verify the errors
  return (
    error.name === "NetworkError" ||
    error.message.includes("timeout") ||
    error.code === "TooManyRequests"
  );
};

/**
 * Initializes the upload process for a queue of files
 * @param {Function} uploadQueue - Current objects in the upload queue
 * @param {Function} onItemProgress - Callback for item progress updates
 * @param {Function} onItemComplete - Callback for item completion
 * @param {Function} onItemError - Callback for item errors
 * @returns {Object} - Controls for the upload process
 */
export const initializeUpload = (
  uploadQueue,
  onItemProgress,
  onItemComplete,
  onItemError,
  options
) => {
  const controller = processQueue(
    uploadQueue,
    processFileWithRetry,
    onItemProgress,
    onItemComplete,
    onItemError,
    options
  );

  return {
    pause: controller.pause,
    resume: controller.resume,
    cancel: controller.cancel,
    getStatus: controller.getStatus,
  };
};
