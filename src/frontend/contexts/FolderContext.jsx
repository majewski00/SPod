import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createFolder, findFolder } from "../services/api/folders";

const FolderContext = createContext();
const rootFolderDefault = {
  id: "root",
  name: "All Files",
  path: "home",
};

export function FolderProvider({ children }) {
  const [currentFolder, setCurrentFolder] = useState(rootFolderDefault);
  const [breadcrumbs, setBreadcrumbs] = useState(() => {
    const { id, ...rootFolderWithoutId } = rootFolderDefault;
    return [rootFolderWithoutId];
  });
  const [error, setError] = useState(null);

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
    const stripedPath = location.pathname.substring(1);
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
      const folderData = await findFolder(folderPath); // TODO: handle error if folder not found
      setCurrentLocation({
        id: folderData.itemId.S,
        name: folderData.itemName.S,
        path: folderData.itemPath.S,
      });
    } catch (error) {
      console.error("Error fetching folder details:", error);
    }
  };

  const navigateToFolder = (folderId, folderName, folderPath) => {
    if (!folderId && !folderName && !folderPath) {
      setError("At least folderPath is required to navigate to a folder.");
      return;
    }

    if (!folderId || !folderName) {
      if (folderPath === rootFolderDefault.path) {
        setCurrentLocation(rootFolderDefault);
      } else {
        fetchFolderDetails(folderPath);
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
