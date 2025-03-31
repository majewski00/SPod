import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "./html",
  resolve: {
    alias: {
      "/main.jsx": "../main.jsx",
    },
  },
  define: {
    "process.env": {
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
      COGNITO_DOMAIN: process.env.COGNITO_DOMAIN,
      COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID,
      AWS_REGION: process.env.AWS_REGION,
    },
  },
  server: {
    port: 4000,
  },
});
