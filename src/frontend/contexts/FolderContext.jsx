import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createFolder, findFolder } from "../services/api/folders";

const FolderContext = createContext();

export function FolderProvider({ children }) {
  const rootFolderDefault = {
    id: "root",
    name: "Home",
    path: "home",
  };
  const [currentFolder, setCurrentFolder] = useState(rootFolderDefault);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: "root", name: "Home", path: "/" },
  ]);
  const navigate = useNavigate();

  // const location = useLocation();
  // useEffect(() => {
  //   if (!location.pathname.startsWith("/home")) {
  //     return;
  //   }

  //   if (location.pathname === "/home") {
  //     setCurrentFolder(rootFolderDefault);
  //     return;
  //   }
  //   const match = location.pathname.match(/\/home\/(.+?)\/?$/);
  //   const folderNameFromUrl = match ? match[1].split("/").pop() : null;

  //   if (folderNameFromUrl !== currentFolder.name) {
  //     fetchFolderDetails(folderNameFromUrl);
  //   }
  // // ! If names are not unique, how could we find correct folder by its name
  // }, [location.pathname]);
  // const fetchFolderDetails = async (folderName) => {
  //   try {
  //     const folderData = await collectFolderInfo(folderName);
  //     setCurrentFolder({
  //       id: folderData.itemId,
  //       name: folderData.itemName,
  //       path: folderData.itemPath,
  //     });
  //     // TODO: (later on) if collected all folders, then creating breadcrumbs is easy
  //   } catch (error) {
  //   }
  // };

  const navigateToFolder = (folderId, folderName, folderPath) => {
    setCurrentFolder({ id: folderId, name: folderName, path: folderPath });
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
