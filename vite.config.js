import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-link",
      "react-is",
      "recharts",
    ],
    exclude: ["@tanstack/react-query-devtools"], // Exclude devtools from optimization
  },
  server: {
    host: true, // 👉 expose dev server to network (LAN)
    port: 5173,
    strictPort: false,

    proxy: {
      "/api/v1/statistics": {
        target: "http://localhost:8003",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
