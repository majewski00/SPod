import * as ROUTES from "constants/routes";
import { getJson, postJson } from "./handler";

export const uploadFile = (
  parentId,
  fileName,
  fileType,
  fileSize,
  itemPath,
  encryptedDataKey,
  fileHash,
  hasThumbnail
) =>
  postJson(
    ROUTES.FILE_UPLOAD,
    {
      parentId,
      fileName,
      fileType,
      fileSize,
      itemPath: encodeURIComponent(itemPath),
      encryptedDataKey,
      fileHash,
      hasThumbnail,
    },
    {},
    { cacheBust: true }
  );

export const downloadFile = (fileId, parentId) =>
  getJson(
    ROUTES.FILE_DOWNLOAD,
    { fileId, parentId }, // TODO
    {},
    {},
    { cacheBust: true }
  );
