import * as ROUTES from "constants/routes";
import { getJson, postJson } from "./handler";

export const uploadThumbnail = (
  fileId,
  parentId,
  thumbName,
  thumbSize,
  thumbType,
  encryptedDataKey,
  thumbHash
) =>
  postJson(
    ROUTES.THUMBNAIL_UPLOAD,
    {
      fileId,
      parentId,
      thumbName,
      thumbSize,
      thumbType,
      encryptedDataKey,
      thumbHash,
    },
    {},
    { cacheBust: true }
  );
