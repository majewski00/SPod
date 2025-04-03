import { useAsync } from "./useAsync";
import { useState, useEffect } from "react";
import { listItems, getThumbnails } from "../services/api/folders";
import { useUserAttributes } from "./useUserAttributes";

/**
 * Custom hook for fetching dashboard data
 * @returns {Object} Object containing dashboard data and loading states
 */
export function useDashboardData() {
  const { getUserFullName } = useUserAttributes();

  // Fetch root folder items
  const {
    data: rootItems,
    loading: loadingRootItems,
    error: rootItemsError,
    execute: reloadRootItems,
  } = useAsync(() => listItems("root"), true, []);

  console.log("Root items:", rootItems); // Debugging log

  // TODO: verify that if server is available but DDB is empty, we get an empty array and not null
  // Set error if rootItems is null (which happens when API returns HTML or error)
  useEffect(() => {
    if (rootItems === null && !loadingRootItems) {
      console.error("Root items data is null, setting error state");
      setError(
        new Error("Failed to load data. The server may be unavailable.")
      );
    }
  }, [rootItems, loadingRootItems]);

  // Fetch recent files (using thumbnails endpoint for preview images)
  // const {
  //   data: recentFiles,
  //   loading: loadingRecentFiles,
  //   error: recentFilesError,
  // } = useAsync(() => getThumbnails("recent"), true, []);

  // Calculate storage statistics
  const storageStats = rootItems
    ? {
        totalFiles: rootItems.filter((item) => !item.isFolder).length,
        totalFolders: rootItems.filter((item) => item.isFolder).length,
        storageUsed: rootItems
          .filter((item) => !item.isFolder)
          .reduce((total, file) => total + (file.size || 0), 0),
        storageLimit: 1024 * 1024 * 1024 * 5, // 5GB example limit
      }
    : null;

  // Mock activity data (to be replaced with real API)
  const activityData = [
    {
      id: 1,
      action: "upload",
      itemName: "Project Proposal.docx",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: 2,
      action: "create_folder",
      itemName: "New Project",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 3,
      action: "download",
      itemName: "Financial Report.xlsx",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      id: 4,
      action: "rename",
      itemName: "Meeting Notes.txt",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];
  // Create a local error state to handle null data
  const [error, setError] = useState(null);

  // return {
  //   userName: user?.attributes?.name || "User",
  //   rootItems: Array.isArray(rootItems) ? rootItems : [],
  //   recentFiles,
  //   storageStats,
  //   activityData,
  //   loading: loadingRootItems || loadingRecentFiles,
  //   error: rootItemsError || recentFilesError || error,
  //   reload: () => {
  //     setError(null);
  //     reloadRootItems();
  //   },
  // };
  return {
    userName: getUserFullName(),
    rootItems: Array.isArray(rootItems) ? rootItems : [],
    recentFiles: [],
    storageStats,
    activityData,
    loading: loadingRootItems,
    error: rootItemsError || error,
    reload: () => {
      setError(null);
      reloadRootItems();
    },
  };
}
