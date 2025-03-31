import * as ROUTES from "constants/routes";
import { getJson, postJson } from "../apiHandlers";

export const uploadFile = (parentId, fileName, fileType, fileSize) =>
  postJson(
    ROUTES.FILE_UPLOAD,
    { parentId, fileName, fileType, fileSize },
    {},
    { cacheBust: true }
  );

export const downloadFile = (fileId) =>
  getJson(ROUTES.FILE_DOWNLOAD, { fileId }, {}, {}, { cacheBust: true });
