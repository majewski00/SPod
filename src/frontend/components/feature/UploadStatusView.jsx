import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  List,
  ListItem,
  Divider,
  Button,
} from "@mui/material";
import {
  PauseCircleOutline,
  PlayCircleOutline,
  Cancel,
  NavigateNext,
  CheckCircle,
  ExpandLess,
  ExpandMore,
  ErrorOutline,
} from "@mui/icons-material";
import { red } from "@mui/material/colors";
import { getIconForFile } from "../common/FileTypeIcons";

const UploadStatusView = ({
  uploadQueue = [],
  onPauseUpload,
  onResumeUpload,
  onCancelUpload,
  isPaused,
}) => {
  const [activeUploads, setActiveUploads] = useState(0);
  const [completedUploads, setCompletedUploads] = useState(0);
  const [failedUploads, setFailedUploads] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!uploadQueue.length) return;

    let active = 0;
    let completed = 0;
    let failed = 0;

    uploadQueue.forEach((item) => {
      const progress = Number(item.progress);
      if (progress === 100) {
        completed++;
      } else if (progress === -1) {
        failed++;
      } else {
        active++;
      }
    });

    setActiveUploads(active);
    setCompletedUploads(completed);
    setFailedUploads(failed);
  }, [uploadQueue]);

  if (!uploadQueue || uploadQueue.length === 0) {
    return null;
  }

  if (isCollapsed) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 350,
          zIndex: 1000,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 1,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            File Uploads{" "}
            {isPaused
              ? "(Paused)"
              : activeUploads > 0
              ? `(${activeUploads} Active)`
              : ""}
          </Typography>
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setIsCollapsed(false)}
            title="Expand Uploads"
          >
            <ExpandLess />
          </IconButton>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        width: 350,
        maxHeight: "60vh",
        zIndex: 1000,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body1" fontWeight="bold">
          File Uploads
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {activeUploads > 0 && (
            <IconButton
              size="small"
              color="inherit"
              onClick={isPaused ? onResumeUpload : onPauseUpload}
              title={isPaused ? "Resume Upload" : "Pause Upload"}
            >
              {isPaused ? <PlayCircleOutline /> : <PauseCircleOutline />}
            </IconButton>
          )}
          {activeUploads > 0 ? (
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setIsCollapsed(true)}
              title="Collapse Uploads"
            >
              <ExpandMore />
            </IconButton>
          ) : (
            <IconButton
              size="small"
              color="inherit"
              onClick={onCancelUpload}
              title="Close Upload Panel"
            >
              <Cancel />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1, bgcolor: "background.paper" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2">{activeUploads} Active</Typography>
            <NavigateNext sx={{ mx: 0.5, fontSize: 18 }} />
            <Typography variant="body2" color="success.main">
              {completedUploads} Completed
            </Typography>
          </Box>

          {failedUploads > 0 && (
            <Typography variant="body2" color="error.main">
              {failedUploads} Failed
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />

      {/* File List */}
      <List
        sx={{
          overflow: "auto",
          maxHeight: "calc(60vh - 110px)",
          p: 0,
        }}
      >
        {uploadQueue.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem
              sx={{
                py: 1.5,
                px: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Thumbnail or Icon */}
              <Box
                sx={{
                  position: "relative",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  overflow: "hidden",
                  filter:
                    item.progress === 100
                      ? "none"
                      : item.progress === -1
                      ? "grayscale(0.7) brightness(0.8)"
                      : "grayscale(0.5) brightness(0.9)",
                  transition: "filter 0.5s ease",
                }}
              >
                {item.result && item.result.thumbnailUrl ? (
                  <img
                    src={item.result.thumbnailUrl}
                    alt={item.file.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      color: "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getIconForFile(item.file)}
                  </Box>
                )}

                <CircularProgress
                  variant="determinate"
                  value={item.progress === -1 ? 0 : Number(item.progress) || 0}
                  size={48}
                  thickness={4}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: item.progress === -1 ? "error.main" : "primary.main",
                    opacity: item.progress === 100 ? 0 : 1,
                    transition: "transform 0.3s ease, opacity 0.5s ease",
                    "& .MuiCircularProgress-circle": {
                      transition: "stroke-dashoffset 0.5s ease-in-out",
                    },
                  }}
                />

                {(item.progress === 100 || item.progress === -1) && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      borderRadius: "50%",
                      fontSize: 24,
                      opacity: 0,
                      animation: "fadeIn 0.3s ease forwards",
                      "@keyframes fadeIn": {
                        "0%": { opacity: 0, transform: "scale(0.8)" },
                        "100%": { opacity: 1, transform: "scale(1)" },
                      },
                      animationDelay: item.progress === 100 ? "0.2s" : "0s",
                    }}
                  >
                    {item.progress === 100 ? (
                      // <CheckCircleOutline color="disabled" />
                      <CheckCircle />
                    ) : (
                      <ErrorOutline sx={{ color: red[400] }} />
                    )}
                  </Box>
                )}
              </Box>

              {/* File Info */}
              <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                <Typography
                  variant="body2"
                  noWrap
                  title={item.file.name}
                  sx={{ fontWeight: "medium" }}
                >
                  {item.file.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                >
                  {formatFileSize(item.file.size)} •{" "}
                  {getStatusText(item.status, item.progress)}
                </Typography>
                {item.error && (
                  <Typography variant="caption" color="error">
                    {item.error}
                  </Typography>
                )}
              </Box>
            </ListItem>
            {index < uploadQueue.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {(failedUploads > 0 || completedUploads === uploadQueue.length) && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => {
              // Clear completed and failed uploads
              // This would need to be implemented in the parent component
              if (onCancelUpload) onCancelUpload(true); // TODO: Implement different clear logic
            }}
          >
            Clear {completedUploads === uploadQueue.length ? "All" : "Finished"}{" "}
            Uploads
          </Button>
        </Box>
      )}
    </Paper>
  );
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getStatusText = (status, progress) => {
  if (progress === -1) {
    return "Failed";
  } else if (progress === 0) {
    return "Waiting...";
  } else if (progress === 100) {
    return "Completed";
  } else if (progress > 0 && progress < 100) {
    if (status === "processing") {
      return `Processing ${progress}%`;
    } else {
      return `Uploading ${progress}%`;
    }
  } else {
    return status || "Unknown";
  }
};

export default UploadStatusView;
