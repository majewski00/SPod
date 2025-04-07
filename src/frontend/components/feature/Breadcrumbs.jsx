import React from "react";
import {
  Box,
  Typography,
  Link,
  Breadcrumbs as MuiBreadcrumbs,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const Breadcrumbs = ({ breadcrumbs, navigateToFolder, currentFolderName }) => {
  // If no breadcrumbs or only root breadcrumb, just show the location title
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return (
      <Typography variant="h5" fontWeight="bold">
        All Files
      </Typography>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs navigation */}
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 1 }}
      >
        {breadcrumbs.map((crumb, index) => (
          <Link
            key={index}
            color="inherit"
            component="button"
            variant="body2"
            onClick={() => navigateToFolder(null, null, crumb.path)}
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              cursor: "pointer",
            }}
          >
            {crumb.name}
          </Link>
        ))}
      </MuiBreadcrumbs>

      {/* Current folder title */}
      <Typography variant="h5" fontWeight="bold">
        {currentFolderName}
      </Typography>
    </Box>
  );
};

export default Breadcrumbs;
