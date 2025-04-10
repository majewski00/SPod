import { uploadFile } from "../api/files";

export const uploadToS3 = async (
  file,
  fileHash,
  encryptedDataKey = "", // TODO: remove optional
  thumbnail = null,
  options
) => {
  try {
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    const { parentId = "root", itemLocation = "home" } = options;
    const itemPath = `${itemLocation}/${fileName}`;

    const response = await uploadFile(
      parentId,
      fileName,
      fileType,
      fileSize,
      itemPath,
      encryptedDataKey,
      fileHash
    );
    // TODO use this fileId to upload thumbnail
    const { url, fileId } = response;

    const uploadResponse = await uploadFileToS3(file, url, fileType);

    return {
      success: true,
      fileId,
    };
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
