import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "./html",
  resolve: {
    alias: {
      "/main.jsx": path.resolve(__dirname, "./main.jsx"),
      constants: path.resolve(__dirname, "../constants"),
    },
  },
  define: {
    "process.env": {
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
      COGNITO_DOMAIN: process.env.COGNITO_DOMAIN,
      COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID,
      AWS_REGION: process.env.AWS_REGION,
      VITE_API_BASE_URL: "",
    },
  },
  server: {
    port: 4000,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
