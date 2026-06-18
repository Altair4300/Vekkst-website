import path from "path";
const __dirname = import.meta.dirname;
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Proxy API calls to the main backend during development.
      // Set VITE_API_URL in .env to point at your backend (e.g. http://localhost:3000).
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // These aliases mirror the backend tsconfig so that the AppRouter type
      // import in src/providers/trpc.tsx resolves correctly at build time.
      "@contracts": path.resolve(__dirname, "../source/contracts"),
      "@db": path.resolve(__dirname, "../source/db"),
    },
  },
  envDir: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, "public"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
