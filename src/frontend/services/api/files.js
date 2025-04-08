import * as ROUTES from "constants/routes";
import { getJson, postJson } from "./handler";

export const uploadFile = (parentId, fileName, fileType, fileSize, itemPath) =>
  postJson(
    ROUTES.FILE_UPLOAD,
    {
      parentId,
      fileName,
      fileType,
      fileSize,
      itemPath: encodeURIComponent(itemPath),
    },
    {},
    { cacheBust: true }
  );

export const downloadFile = (fileId) =>
  getJson(ROUTES.FILE_DOWNLOAD, { fileId }, {}, {}, { cacheBust: true });
