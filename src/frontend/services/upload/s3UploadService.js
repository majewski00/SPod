import { uploadFile } from "../api/files";
import { uploadThumbnail } from "../api/thumbnails";

export const uploadToS3 = async (
  file,
  fileHash,
  encryptedDataKey = "", // TODO: remove optional
  options
) => {
  try {
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    const {
      parentId = "root",
      itemLocation = "home",
      hasThumbnail = false,
      isThumbnail = false,
      fileId = null,
    } = options;

    let response = null;

    if (!isThumbnail) {
      const itemPath = `${itemLocation}/${fileName}`;

      response = await uploadFile(
        parentId,
        fileName,
        fileType,
        fileSize,
        itemPath,
        encryptedDataKey,
        fileHash,
        hasThumbnail
      );
    } else {
      response = await uploadThumbnail(
        fileId,
        parentId,
        fileName,
        fileSize,
        fileType,
        encryptedDataKey,
        fileHash
      );
    }

    await uploadFileToS3(file, response.uploadURL, fileType);

    return response?.fileId;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

const uploadFileToS3 = async (file, presignedUrl, fileType) => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": fileType },
      body: file,
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} - ${response.statusText}`
      );
    }

    return { status: response.status };
  } catch (error) {
    throw error;
  }
};
