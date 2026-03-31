import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  define: {
    // Required for React in production IIFE bundle
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/web-components/index.ts"),
      name: "AEMHeadlessWC",
      formats: ["iife"],
      fileName: () => "web-components.js",
    },
    outDir: "dist-wc",
    emptyOutDir: true,
    rollupOptions: {
      // Bundle everything — no externals; this must be self-contained on CDN
      external: [],
    },
    cssCodeSplit: false,
  },
});
