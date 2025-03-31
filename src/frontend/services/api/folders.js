import * as ROUTES from "constants/routes";
import { getJson, postJson } from "../apiHandlers";

export const listItems = (folderId) =>
  getJson(ROUTES.FOLDER_LIST_ITEMS, { folderId }, {}, {}, { cacheBust: false });

export const createFolder = (folderName, parentId) =>
  postJson(
    ROUTES.FOLDER_CREATE,
    { folderName, parentId },
    {},
    { cacheBust: true }
  );

export const getThumbnails = (folderId) =>
  getJson(ROUTES.FOLDER_THUMBNAILS, { folderId }, {}, {}, { cacheBust: true });
