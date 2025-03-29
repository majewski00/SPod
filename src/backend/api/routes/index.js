import filesRoutes from "./files.js";
import foldersRoutes from "./folders.js";

export default (router) => {
  filesRoutes(router);
  foldersRoutes(router);
};
