import React, { lazy, Suspense } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderPage from "../pages/LoaderPage";

// Lazy load the page components
const LoginPage = lazy(() => import("../pages/SignInPage"));
const HomePage = lazy(() => import("../pages/HomePage"));

const AppRoutes = () => {
  const { authStatus } = useAuthenticator((context) => {
    return [context.authStatus];
  });

  return (
    <Suspense fallback={<LoaderPage />}>
      <Routes>
        {authStatus === "authenticated" ? (
          <>
            <Route path="/home" element={<HomePage />} />
            <Route path="/files" element={<HomePage />} />
            <Route path="/files/:folderId" element={<HomePage />} />
            <Route path="/recent" element={<HomePage />} />
            <Route path="/shared" element={<HomePage />} />
            <Route path="/trash" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </>
        ) : (
          <>
            <Route path="/auth" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
