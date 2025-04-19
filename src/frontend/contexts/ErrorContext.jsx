import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";
import { StatusCodes } from "http-status-codes";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!error) return;
    setOpen(true);
  }, [error]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
    setTimeout(() => setError(null), 300);
  };

  const showError = ({
    message = "Unknown",
    status = StatusCodes.BAD_REQUEST,
  }) => {
    setError({ message, status });
  };

  const clearError = () => {
    setError(null);
    setOpen(false);
  };

  return (
    <ErrorContext.Provider
      value={{ error, StatusCodes, showError, clearError }}
    >
      {children}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={
            error?.status === StatusCodes.NOT_FOUND ? "warning" : "error"
          }
          sx={{ width: "100%" }}
        >
          {error?.message}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
