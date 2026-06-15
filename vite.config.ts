import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "elena-widget.js",
        chunkFileNames: "elena-widget-[name]-[hash].js", // chunks lazy (p. ej. voz)
        assetFileNames: "elena-widget.[ext]"
      }
    }
  }
});
