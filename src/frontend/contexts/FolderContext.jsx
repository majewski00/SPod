import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createFolder, fetchFolder } from "../services/api/folders";
import { useError } from "./ErrorContext";

const rootFolderDefault = {
  id: "root",
  name: "All Files",
  path: "home",
};

const FolderContext = createContext();

export function FolderProvider({ children }) {
  const [currentFolder, setCurrentFolder] = useState(rootFolderDefault);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const { showError, StatusCodes } = useError();

  const setCurrentLocation = ({ id, name, path }) => {
    setCurrentFolder({ id, name, path });

    const pathSegments = path.split("/");
    const newBreadcrumbs = [];
    let currentPath = "";

    for (let i = 0; i < pathSegments.length - 1; i++) {
      currentPath = currentPath
        ? `${currentPath}/${pathSegments[i]}`
        : pathSegments[i];
      newBreadcrumbs.push({
        name: i === 0 ? rootFolderDefault.name : pathSegments[i],
        path: currentPath,
      });
    }
    setBreadcrumbs(newBreadcrumbs);
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const decodedPath = decodeURIComponent(location.pathname);
    const stripedPath = decodedPath.substring(1);

    if (stripedPath === currentFolder.path) {
      return;
    }
    if (!stripedPath.startsWith(rootFolderDefault.path)) {
      return;
    }
    if (stripedPath === rootFolderDefault.path) {
      setCurrentLocation(rootFolderDefault);
      return;
    }

    fetchFolderDetails(stripedPath);
  }, [location.pathname]);

  const fetchFolderDetails = async (folderPath) => {
    try {
      const folderData = await fetchFolder(folderPath);
      setCurrentLocation({
        id: folderData.itemId.S,
        name: folderData.itemName.S,
        path: folderData.itemPath.S,
      });
    } catch (error) {
      if (error.status === StatusCodes.NOT_FOUND) {
        navigateToFolder(null, null, rootFolderDefault.path); // TODO: useRef to keep track of the last viewed folder and navigate to it
      }
      showError(error);
    }
  };

  const navigateToFolder = async (folderId, folderName, folderPath) => {
    if (!folderId && !folderName && !folderPath) {
      showError({
        message: "At least folderPath is required to navigate to a folder.",
        status: 400,
      });
      return;
    }
    if (!folderId || !folderName) {
      if (folderPath === rootFolderDefault.path) {
        setCurrentLocation(rootFolderDefault);
      } else {
        await fetchFolderDetails(folderPath);
      }
    } else {
      setCurrentLocation({ id: folderId, name: folderName, path: folderPath });
    }

    navigate(folderPath);
  };

  const createNewFolder = async (folderName) => {
    const folderPath = `${currentFolder.path}/${folderName}`;
    try {
      const { folderId } = await createFolder(
        folderName,
        currentFolder.id,
        folderPath
      );
      navigateToFolder(folderId, folderName, folderPath);
    } catch (error) {
      console.error("Error creating folder:", error);
      showError(error);
    }
  };
  return (
    <FolderContext.Provider
      value={{ currentFolder, breadcrumbs, navigateToFolder, createNewFolder }}
    >
      {children}
    </FolderContext.Provider>
  );
}

export const useFolderContext = () => {
  return useContext(FolderContext);
};
