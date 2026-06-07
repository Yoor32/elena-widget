import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "elena-widget.js",
        assetFileNames: "elena-widget.[ext]"
      }
    }
  }
});
