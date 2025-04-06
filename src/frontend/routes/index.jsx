import React, { lazy, Suspense } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderPage from "../pages/LoaderPage";
import { FolderProvider } from "../contexts/FolderContext";

// Lazy load the page components
const LoginPage = lazy(() => import("../pages/SignInPage"));
const HomePage = lazy(() => import("../pages/HomePage"));

const AppRoutes = () => {
  const { authStatus } = useAuthenticator((context) => {
    return [context.authStatus];
  });

  switch (authStatus) {
    case "configuring":
      // return <LoaderPage />;
      break;
    case "authenticated":
      return (
        // <Suspense fallback={<LoaderPage />}>
          <FolderProvider>
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/home/*" element={<HomePage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </FolderProvider>
        // </Suspense>
      )
    case "unauthenticated":
      return (
        <Suspense fallback={<LoaderPage />}>
          <Routes>
            <Route path="/auth" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Suspense>
      )
    default:
      break;
  }
};

export default AppRoutes;
