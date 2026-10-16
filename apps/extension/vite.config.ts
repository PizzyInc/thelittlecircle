import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension from "vite-plugin-web-extension";

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: "./manifest.json",
      additionalInputs: ["src/content.tsx"],
    }),
  ],
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
