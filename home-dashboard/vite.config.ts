import { defineConfig } from "vite";

import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 100,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
      manualChunks: {
        mui: ["@mui/material"],
        muiIcons: ["@mui/icons-material"],
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: { name: "Home Monitor", short_name: "Home" },
    }),
  ],
});
