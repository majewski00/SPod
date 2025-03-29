export const API = "/api/v1"; // todo: should there be a versioning strategy? (v1)
export const FILE_UPLOAD = `${API}/files/upload`;
export const FILE_DOWNLOAD = `${API}/files/:fileId/download`;
export const FOLDER_LIST_ITEMS = `${API}/folders/:folderId/items`;
export const FOLDER_CREATE = `${API}/folders/create`;
export const FOLDER_THUMBNAILS = `${API}/folders/:folderId/thumbnails`;
