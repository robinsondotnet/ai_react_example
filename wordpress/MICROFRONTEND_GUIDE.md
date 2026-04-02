# Adding a New Microfrontend

This guide explains how to add a new microfrontend bundle to the WordPress shell.

## Overview

Each microfrontend is a **self-contained IIFE bundle** that registers one or more web component custom elements. WordPress loads the bundle and authors place the custom elements on pages via shortcodes or Gutenberg blocks.

## Step-by-Step

### 1. Build the IIFE bundle

Use any framework (React, Vue, Svelte, vanilla JS) — the only requirement is that the output is a single IIFE file that calls `customElements.define()`.

Example Vite config for a React-based microfrontend:

```js
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "MyWidget",
      formats: ["iife"],
      fileName: () => "bundle.js",
    },
    outDir: "dist",
    cssCodeSplit: false,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": "{}",
    "process": JSON.stringify({ env: { NODE_ENV: "production" } }),
  },
});
```

### 2. Place the bundle

Copy the built file into the MFE bundles directory:

```
wordpress/mu-plugins/mfe-bundles/{your-slug}/bundle.js
```

Example:
```
wordpress/mu-plugins/mfe-bundles/analytics-dashboard/bundle.js
```

### 3. Register in WordPress Admin

1. Go to **Settings → Microfrontends**
2. Fill in the "Register New Bundle" form:
   - **Slug**: `analytics-dashboard`
   - **Label**: `Analytics Dashboard`
   - **Script URL**: The full URL to your bundle (auto-detected from bundles dir, or paste a CDN URL)
   - **Custom Elements**: `analytics-dashboard,analytics-chart` (comma-separated)
   - **Load On**: `All pages` or `Only pages using its elements`
3. Click **Register Bundle**

### 4. Use in pages

**Shortcode:**
```
[mfe element="analytics-dashboard" attrs="api-key=abc123 theme=dark"]
```

**Gutenberg:** Add an "MFE Component" block → select element → set attributes.

### 5. (Optional) Set up a dev workflow

For local development with hot reload:

```bash
# Terminal 1: WordPress
cd wordpress && docker compose up -d

# Terminal 2: Vite watch mode for your MFE
cd my-mfe && npx vite build --watch --outDir ../wordpress/mu-plugins/mfe-bundles/my-mfe/
```

Changes are picked up immediately — no Docker restart needed.

## Conventions

| Convention | Rule |
|-----------|------|
| Bundle format | IIFE (single file, no externals) |
| Custom element naming | Kebab-case, prefixed with your domain (e.g., `acme-widget`) |
| Shadow DOM | Recommended for style isolation |
| CSS | Embed in bundle (Tailwind `?inline` or CSS-in-JS) |
| Data fetching | Use attributes for config; fetch data internally |
| Bundle directory | `wordpress/mu-plugins/mfe-bundles/{slug}/` |

## Example: Existing AEM Articles MFE

The `aem-articles` bundle demonstrates all patterns:

- **Source**: `nextjs-app/src/web-components/`
- **Build**: `cd nextjs-app && npm run build:wc`
- **Output**: `nextjs-app/public/dist-wc/web-components.js`
- **Deployed**: `wordpress/mu-plugins/mfe-bundles/aem-articles/web-components.js`
- **Elements**: `aem-headless-app`, `aem-article-list`, `aem-article-detail`
- **Data source**: Fetches from `{aem-host}/graphql/execute.json/...` (WordPress or AEM)
