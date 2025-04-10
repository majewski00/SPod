import { generateThumbnail } from "./thumbnailService";
// import { encryptFile } from "./encryptionService";
import { calculateHash } from "./hashService";
import { uploadToS3 } from "./s3UploadService";
import { processQueue } from "./queueProcessor";

/**
 * Processes a single file through the upload pipeline
 * @param {File} file - The file object to process
 * @param {Function} onItemProgress - Callback for item progress updates
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Result of the upload process
 */
const processFile = async (file, onItemProgress, options) => {
  try {
    const thumbnail = await generateThumbnail(file);

    // const encryptedFile = await encryptFile(file);

    const fileHash = await calculateHash(file);

    // Calculate hash for thumbnail if it exists
    let thumbnailHash = null;
    if (thumbnail && thumbnail.file) {
      thumbnailHash = await calculateHash(thumbnail.file);
    }

    const uploadResult = await uploadToS3(
      file, // TODO Using the original file since we're not encrypting yet
      fileHash,
      "", // TODO No encrypted data key for now
      thumbnail,
      options
    );

    return {
      success: true,
      fileId: uploadResult.fileId,
      thumbnail: thumbnail
        ? {
            url: thumbnail.url,
            hash: thumbnailHash,
          }
        : null,
      hash: fileHash,
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
 * @param {Function} uploadQueue - Callback to get the current objects in the upload queue // todo update
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
