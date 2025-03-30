import filesRoutes from "./files";
import foldersRoutes from "./folders";

export default (router) => {
  filesRoutes(router);
  foldersRoutes(router);
};
