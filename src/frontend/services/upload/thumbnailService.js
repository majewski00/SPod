const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 360;

/**
 * Generates a thumbnail from a file
 * @param {File} file - The file to generate a thumbnail from
 * @param {Object} options - Optional parameters
 * @param {number} options.width - Thumbnail width (default: 480px)
 * @param {number} options.height - Thumbnail height (default: 360px)
 * @param {number} options.quality - JPEG quality for images (0-1, default: 0.8)
 * @param {number} options.frameTime - Time in seconds to extract frame from video (default: 1)
 * @returns {Promise<Object|null>} - Thumbnail object or null if generation not supported
 */
export const generateThumbnail = async (file, options = {}) => {
  const width = options.width || THUMBNAIL_WIDTH;
  const height = options.height || THUMBNAIL_HEIGHT;
  const quality = options.quality || 0.8;
  const frameTime = options.frameTime || 1;

  try {
    const fileType = getFileType(file);

    if (fileType === "image") {
      return await generateImageThumbnail(file, { width, height, quality });
    } else if (fileType === "video") {
      return await generateVideoThumbnail(file, {
        width,
        height,
        quality,
        frameTime,
      });
    } else {
      console.log(
        `No thumbnail generation available for file type: ${file.type}`
      );
      return null;
    }
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
};

const getFileType = (file) => {
  const type = file.type.toLowerCase();

  if (type.startsWith("image/")) {
    return "image";
  } else if (type.startsWith("video/")) {
    return "video";
  }

  return "other";
};

const generateImageThumbnail = async (file, { width, height, quality }) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const dimensions = calculateDimensions(
        img.width,
        img.height,
        width,
        height
      );
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create thumbnail blob"));
            return;
          }
          const thumbnailFile = new File([blob], `thumb_${file.name}.jpg`, {
            type: "image/jpeg",
          });
          const thumbnailUrl = URL.createObjectURL(thumbnailFile);
          resolve({
            file: thumbnailFile,
            url: thumbnailUrl,
            width: dimensions.width,
            height: dimensions.height,
            originalFile: file.name,
          });
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for thumbnail generation"));
    };
    img.src = url;
  });
};

const generateVideoThumbnail = async (
  file,
  { width, height, quality, frameTime }
) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.autoplay = false;
    video.muted = true;
    video.src = url;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(frameTime, video.duration * 0.1);
    };
    video.onseeked = () => {
      const dimensions = calculateDimensions(
        video.videoWidth,
        video.videoHeight,
        width,
        height
      );

      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(video, 0, 0, dimensions.width, dimensions.height);
      URL.revokeObjectURL(url);
      video.pause();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create video thumbnail blob"));
            return;
          }
          const thumbnailFile = new File([blob], `thumb_${file.name}.jpg`, {
            type: "image/jpeg",
          });
          const thumbnailUrl = URL.createObjectURL(thumbnailFile);
          resolve({
            file: thumbnailFile,
            url: thumbnailUrl,
            width: dimensions.width,
            height: dimensions.height,
            originalFile: file.name,
            frameTime,
          });
        },
        "image/jpeg",
        quality
      );
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video for thumbnail generation"));
    };
    video.load();
  });
};

/**
 * Calculates dimensions while maintaining aspect ratio
 */
const calculateDimensions = (srcWidth, srcHeight, maxWidth, maxHeight) => {
  const aspectRatio = srcWidth / srcHeight;

  let newWidth = maxWidth;
  let newHeight = maxWidth / aspectRatio;

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = maxHeight * aspectRatio;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
};
