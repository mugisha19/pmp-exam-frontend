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
  server: {
    host: true, // 👉 expose dev server to network (LAN)
    port: 5173,
    strictPort: false,

    proxy: {
      "/api/v1": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              "[Vite Proxy] Forwarding:",
              req.url,
              "->",
              options.target + req.url
            );
          });
          proxy.on("error", (err, req, res) => {
            console.error("[Vite Proxy] Error:", err.message);
          });
        },
      },
    },
  },
});
