import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, "../public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries — loaded once, cached by browser
          react: ["react", "react-dom"],
          router: ["react-router"],
          query: ["@tanstack/react-query"],
          trpc: ["@trpc/client", "@trpc/react-query", "@trpc/server"],
          radix: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select", "@radix-ui/react-tabs"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          charts: ["recharts"],
        },
      },
    },
    // Split chunks smaller than 500KB to avoid huge files
    chunkSizeWarningLimit: 500,
    // Minify for production
    minify: "esbuild",
    // CSS optimization
    cssMinify: true,
  },
});
