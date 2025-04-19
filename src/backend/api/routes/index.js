import filesRoutes from "./files";
import foldersRoutes from "./folders";
import thumbnailsRoutes from "./thumbnails";

export default (router) => {
  filesRoutes(router);
  foldersRoutes(router);
  thumbnailsRoutes(router);
};
