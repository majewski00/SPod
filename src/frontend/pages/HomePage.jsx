import React, { useState, lazy, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Box, useTheme, Button } from "@mui/material";
import Header from "../components/layout/Header";
import {
  Navigation,
  drawerWidthCollapsed,
  drawerWidthExpanded,
} from "../components/layout/Navigation";
import ItemListView from "../components/feature/ItemListView";
import ItemActions from "../components/common/ItemActions";
import CreateFolderModal from "../components/common/CreateFolderModal";
import UploadStatusView from "../components/feature/UploadStatusView";
import { useUserAttributes } from "../hooks/useUserAttributes";
import { useFolderContext } from "../contexts/FolderContext";
import { useRetrieveItems } from "../hooks/useRetrieveItems";
import { useFileUpload } from "../hooks/useFileUpload";

const HelloUser = lazy(() => import("../components/common/HelloUser"));

const HomePage = () => {
  const theme = useTheme();
  const { signOut } = useAuthenticator((context) => [context.signOut]);
  const { getUserFullName, userAttributesReady } = useUserAttributes();

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const handleToggleNavigation = () => {
    setIsNavigationOpen(!isNavigationOpen);
  };

  const { currentFolder, navigateToFolder, createNewFolder } =
    useFolderContext();

  const { items, loading, error, reload, reloadType } = useRetrieveItems();

  const {
    openFileSelector,
    uploadQueue,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    isPaused,
  } = useFileUpload(() => {
    console.log("Upload complete, reloading items with fileUpload type.");
    reload("fileUpload");
  });

  const handleUploadClick = () => {
    openFileSelector();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header
        handleDrawerToggle={handleToggleNavigation}
        isDrawerOpen={isNavigationOpen}
      />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: isNavigationOpen
              ? drawerWidthExpanded
              : drawerWidthCollapsed,
            height: "100%",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Navigation isDrawerOpen={isNavigationOpen} />
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            p: 3,
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }}
        >
          {error && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "error.light",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ fontSize: "1.5rem" }}>⚠️</Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ fontWeight: "bold" }}>Error Loading Data</Box>
                <Box>
                  {error.message ||
                    "There was an error loading your dashboard data."}
                </Box>
              </Box>
              <Button variant="contained" color="secondary" onClick={reload}>
                Retry
              </Button>
              <Button variant="outlined" color="secondary" onClick={signOut}>
                Sign Out
              </Button>
            </Box>
          )}

          <HelloUser
            userAttributesReady={userAttributesReady}
            getUserFullName={getUserFullName}
          />

          <ItemActions
            onUploadClick={handleUploadClick}
            onCreateFolderClick={() => setShowCreateFolderModal(true)}
          />

          <Box sx={{ mt: 3 }}>
            <ItemListView
              items={items}
              loading={loading}
              reloadType={reloadType}
            />
          </Box>
        </Box>
      </Box>

      <CreateFolderModal
        open={showCreateFolderModal}
        onSubmit={(folderName) => createNewFolder(folderName)}
        onClose={() => setShowCreateFolderModal(false)}
      />

      <UploadStatusView
        uploadQueue={uploadQueue}
        onPauseUpload={pauseUpload}
        onResumeUpload={resumeUpload}
        onCancelUpload={cancelUpload}
        isPaused={isPaused}
      />
    </Box>
  );
};

export default HomePage;
