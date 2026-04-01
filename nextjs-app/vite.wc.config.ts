import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      // Replace next/link with a plain <a> stub — prevents Next.js router
      // code (and its process.env.__NEXT_* references) from entering the bundle.
      "next/link": resolve(__dirname, "src/web-components/stubs/next-link.tsx"),
    },
  },
  define: {
    // Specific replacements first, then catch-all for any other process.env.*
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": "{}",
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/web-components/index.ts"),
      name: "AEMHeadlessWC",
      formats: ["iife"],
      fileName: () => "web-components.js",
    },
    outDir: "public/dist-wc",
    emptyOutDir: true,
    rollupOptions: {
      // Bundle everything — no externals; this must be self-contained on CDN
      external: [],
    },
    cssCodeSplit: false,
  },
});
