import React from "react";
import { Box, Button } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

/**
 * ItemActions component - displays primary actions for file/folder operations
 * @param {function} onUploadClick - Handler for upload button click
 * @param {function} onCreateFolderClick - Handler for create folder button click
 */
const ItemActions = ({
  onUploadClick,
  onCreateFolderClick
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 4,
        mt: 2
      }}
    >
      <Button
        variant="contained"
        startIcon={<FileUploadIcon />}
        onClick={onUploadClick}
        sx={{
          flex: { xs: '1', sm: '0 0 auto' },
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          px: 3,
          py: 1
        }}
      >
        Upload File
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<CreateNewFolderIcon />}
        onClick={onCreateFolderClick}
        sx={{
          flex: { xs: '1', sm: '0 0 auto' },
          borderColor: 'primary.main',
          color: 'primary.main',
          '&:hover': {
            borderColor: 'primary.dark',
            bgcolor: 'rgba(0, 123, 255, 0.04)',
          },
          px: 3,
          py: 1
        }}
      >
        Create Folder
      </Button>
    </Box>
  );
};

export default ItemActions;