import { useAsync } from "./useAsync";
import { useState, useEffect } from "react";
import { listItems } from "../services/api/folders";
import { useFolderContext } from "../contexts/FolderContext";

export function useRetrieveItems() {
  const [error, setError] = useState(null);
  const [reloadType, setReloadType] = useState("navigation"); // 'navigation', or 'fileUpload'

  const { currentFolder } = useFolderContext();
  const {
    data: items,
    loading: loadingItems,
    error: itemsError,
    execute: reloadItems,
  } = useAsync(() => listItems(currentFolder.id), true, [currentFolder.id]);

  useEffect(() => {
    setReloadType("navigation");
  }, [currentFolder.id]);

  useEffect(() => {
    if (items === null && !loadingItems) {
      setError(
        new Error("Failed to load data. The server may be unavailable.")
      );
    }
  }, [items, loadingItems]);

  return {
    items,
    loading: loadingItems,
    error: error || itemsError,
    reloadType,
    reload: (type = "navigation") => {
      setError(null);
      setReloadType(type);
      reloadItems();
    },
  };
}
