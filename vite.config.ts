import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // React → Preact (preact/compat): reduce ~50% el bundle inicial. El alias es a nivel
  // de bundler; el código y los tipos (@types/react) no cambian.
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react-dom/client": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-runtime"
    }
  },
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
