import * as ROUTES from "constants/routes";
import { getJson, postJson } from "./handler";

export const listItems = (folderId) =>
  getJson(ROUTES.FOLDER_LIST_ITEMS, { folderId }, {}, {}, { cacheBust: false });

export const createFolder = (folderName, parentId, itemPath) =>
  postJson(
    ROUTES.FOLDER_CREATE,
    { folderName, parentId, itemPath: encodeURIComponent(itemPath) },
    {},
    { cacheBust: true }
  );

export const getThumbnails = (folderId) =>
  getJson(ROUTES.FOLDER_THUMBNAILS, { folderId }, {}, {}, { cacheBust: true }); // TODO: add nextToken

export const findFolder = (folderPath) =>
  getJson(
    ROUTES.FOLDER_FIND,
    { folderPath: encodeURIComponent(folderPath) },
    {},
    {},
    { cacheBust: true }
  );
