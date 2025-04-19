import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme,
  Checkbox,
} from "@mui/material";
import PhotoIcon from "@mui/icons-material/Photo";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFolderContext } from "../../contexts/FolderContext";
import Breadcrumbs from "./Breadcrumbs";

const ItemsListView = ({ items, loading, reloadType = "navigation" }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState("list");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  const { currentFolder, navigateToFolder, breadcrumbs } = useFolderContext();

  // Determine if we should show loading state
  // Only show loading for initial load or navigation, not for file upload reloads
  const showLoading = loading && reloadType !== "fileUpload";

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? "Yesterday" : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    }
    return "Just now";
  };

  const getFileType = (fileType) => {
    if (!fileType) return "Unknown";
    const extension = fileType.toLowerCase().split("/").pop();

    const typeMap = {
      pdf: "PDF Document",
      doc: "Word Document",
      docx: "Word Document",
      xls: "Excel Spreadsheet",
      xlsx: "Excel Spreadsheet",
      ppt: "PowerPoint",
      pptx: "PowerPoint",
      txt: "Text File",
      jpg: "Image",
      jpeg: "Image",
      png: "Image",
      gif: "Image",
      mp3: "Audio",
      mp4: "Video",
      folder: "Folder",
    };

    return typeMap[extension] || "Document";
  };

  const sortedFiles = items
    ? [...items].sort((a, b) => {
        let comparison = 0;

        if (sortField === "name") {
          comparison = a.itemName.S.localeCompare(b.itemName.S);
        } else if (sortField === "modified") {
          comparison = new Date(a.updatedAt.S) - new Date(b.updatedAt.S);
        } else if (sortField === "type") {
          comparison = getFileType(a.itemType.S).localeCompare(
            getFileType(b.itemType.S)
          );
        }

        return sortDirection === "asc" ? comparison : -comparison;
      })
    : [];

  if (showLoading || !items) {
    return (
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Breadcrumbs
            breadcrumbs={breadcrumbs}
            navigateToFolder={navigateToFolder}
            currentFolderName={currentFolder.name}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            bgcolor: "transparent",
            overflowX: "hidden",
          }}
        >
          <Table
            sx={{
              tableLayout: "fixed",
              width: "100%",
              maxWidth: "calc(100% - 8px)",
            }}
          >
            <TableHead>
              <TableRow
                onMouseEnter={() => setHoveredRow("header")}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell padding="checkbox" sx={{ width: "48px" }}>
                  {(hoveredRow === "header" || selectedFiles.length > 0) && (
                    <Checkbox disabled={true} />
                  )}
                </TableCell>
                <TableCell sx={{ width: "40%" }}>Name</TableCell>
                <TableCell sx={{ width: "20%" }}>Modified</TableCell>
                <TableCell sx={{ width: "20%" }}>Type</TableCell>
                <TableCell align="right" sx={{ width: "20%" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell padding="checkbox" sx={{ width: "48px" }}>
                    <Skeleton variant="rectangular" width={20} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="40%" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width="100px" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ mt: 3, mb: 3 }}>
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          navigateToFolder={navigateToFolder}
          currentFolderName={currentFolder.name}
          sx={{ mb: 2 }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
          }}
        >
          <PhotoIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No files to display
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          navigateToFolder={navigateToFolder}
          currentFolderName={currentFolder.name}
        />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="grid">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          bgcolor: "transparent",
          overflowX: "hidden",
        }}
      >
        <Table
          sx={{
            tableLayout: "fixed",
            width: "100%",
            maxWidth: "calc(100% - 8px)",
          }}
        >
          <TableHead>
            <TableRow
              onMouseEnter={() => setHoveredRow("header")}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <TableCell padding="checkbox" sx={{ width: "48px" }}>
                {(hoveredRow === "header" || selectedFiles.length > 0) && (
                  <Checkbox
                    indeterminate={
                      selectedFiles.length > 0 &&
                      selectedFiles.length < sortedFiles.length
                    }
                    checked={
                      sortedFiles.length > 0 &&
                      selectedFiles.length === sortedFiles.length
                    }
                    onChange={() => {
                      if (selectedFiles.length > 0) {
                        setSelectedFiles([]);
                      } else {
                        setSelectedFiles(sortedFiles.map((file) => file.id));
                      }
                    }}
                  />
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange("name")}
                sx={{
                  width: "40%",
                  fontWeight: sortField === "name" ? "bold" : "normal",
                  cursor: "pointer",
                  "&:hover": { color: theme.palette.primary.main },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Name
                {sortField === "name" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpwardIcon
                      fontSize="small"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                    />
                  ) : (
                    <ArrowDownwardIcon
                      fontSize="small"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                    />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange("modified")}
                sx={{
                  width: "20%",
                  fontWeight: sortField === "modified" ? "bold" : "normal",
                  cursor: "pointer",
                  "&:hover": { color: theme.palette.primary.main },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Modified
                {sortField === "modified" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpwardIcon
                      fontSize="small"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                    />
                  ) : (
                    <ArrowDownwardIcon
                      fontSize="small"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                    />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange("type")}
                sx={{
                  width: "20%",
                  fontWeight: sortField === "type" ? "bold" : "normal",
                  cursor: "pointer",
                  "&:hover": { color: theme.palette.primary.main },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Type
                {sortField === "type" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpwardIcon
                      fontSize="small"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                    />
                  ) : (
                    <ArrowDownwardIcon
                      fontSize="small"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                    />
                  ))}
              </TableCell>
              <TableCell align="right" sx={{ width: "20%" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFiles.map((item) => {
              const isSelected = selectedFiles.includes(item.itemId.S);

              return (
                <TableRow
                  key={item.itemId.S}
                  hover
                  selected={isSelected}
                  onMouseEnter={() => setHoveredRow(item.itemId.S)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell padding="checkbox" sx={{ width: "48px" }}>
                    {(hoveredRow === item.itemId.S || isSelected) && (
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedFiles(
                              selectedFiles.filter((id) => id !== item.itemId.S)
                            );
                          } else {
                            setSelectedFiles([...selectedFiles, item.itemId.S]);
                          }
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ width: "40%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {/* // TODO: change icons depending on type */}
                      <PhotoIcon
                        sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }}
                      />
                      <Typography
                        variant="body2"
                        noWrap
                        title={item.itemName.S}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          "&:hover": {
                            color: theme.palette.primary.main,
                          },
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          item.itemType.S === "folder"
                            ? navigateToFolder(
                                item.itemId.S,
                                item.itemName.S,
                                item.itemPath.S
                              )
                            : null
                        }
                      >
                        {item.itemName.S}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: "20%" }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatRelativeTime(item.updatedAt.S)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "20%" }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getFileType(item.itemType.S)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ width: "20%" }}>
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rename">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ItemsListView;
