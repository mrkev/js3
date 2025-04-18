import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // for fast refresh, the automatic JSX runtime, etc
    react(),
  ],
  build: {
    outDir: "docs",
  },
  // instead of having absolute paths pointing at assets in `index.html`, use
  // relative paths. Works better with github pages where /assets/foobar.js
  // referes to another site
  base: "./",
});
