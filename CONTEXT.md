# AEM Headless + Next.js — CONTEXT.md

> Last updated: 2026-07-10  
> Status: **Fully runnable — no external services required · Mock content provider active**

---

## 1. Project Structure

```
workspace/aem/
├── CONTEXT.md                          ← this file
│
└── nextjs-app/                         ← Next.js 16 frontend (App Router, TypeScript, Tailwind 4)
    ├── .env.example                    ← env variable template (committed)
    ├── .env.local                      ← local overrides (NOT committed)
    ├── .nvmrc                          ← Node 22
    ├── next.config.ts                  ← Next.js config + CDN mode
    ├── vite.wc.config.ts               ← Vite config for web components
    ├── tsconfig.json                   ← excludes src/web-components (Vite-only)
    ├── tsconfig.wc.json                ← tsconfig for Vite build
    ├── package.json                    ← engines: node >=22.12.0
    │
    ├── src/
    │   ├── app/                        ← Next.js App Router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx                ← home
    │   │   ├── globals.css
    │   │   ├── articles/
    │   │   │   ├── page.tsx            ← article list (reads from content provider)
    │   │   │   └── [slug]/
    │   │   │       ├── page.tsx        ← server wrapper (generateStaticParams)
    │   │   │       └── ArticlePageClient.tsx  ← client-side detail fetch → /api/articles/[slug]
    │   │   ├── api/
    │   │   │   └── articles/
    │   │   │       └── [slug]/
    │   │   │           └── route.ts    ← article detail API (calls content provider)
    │   │   └── graphql/
    │   │       └── execute.json/
    │   │           └── [...query]/
    │   │               └── route.ts    ← mock AEM GraphQL persisted-query endpoint
    │   │
    │   ├── components/
    │   │   ├── ArticleCard.tsx
    │   │   └── ArticleDetail.tsx
    │   │
    │   ├── lib/
    │   │   ├── content/                ← content provider abstraction (active)
    │   │   │   ├── types.ts            ← re-exports ArticleModel (provider-agnostic)
    │   │   │   ├── provider.ts         ← ContentProvider interface
    │   │   │   ├── index.ts            ← selects provider via CONTENT_PROVIDER env var
    │   │   │   ├── mock/
    │   │   │   │   ├── data.ts         ← 5 hardcoded sample articles
    │   │   │   │   └── index.ts        ← mock provider (no HTTP calls)
    │   │   │   └── aem/
    │   │   │       └── index.ts        ← AEM adapter (wraps lib/aem/graphql)
    │   │   │
    │   │   └── aem/                    ← AEM SDK adapter (dormant — preserved for reconnection)
    │   │       ├── types.ts            ← ArticleModel, GraphQL response types
    │   │       ├── aemHeadlessClient.ts ← AEMHeadless singleton
    │   │       ├── graphql.ts          ← getAllArticles, getArticleByPath
    │   │       └── rest.ts             ← fetchAEM, getContentModel
    │   │
    │   ├── types/
    │   │   ├── aem-headless-client-js.d.ts   ← manual types for Adobe SDK
    │   │   └── css-inline.d.ts               ← declares *.css?inline for Vite
    │   │
    │   └── web-components/             ← Custom Elements for CDN delivery
    │       ├── index.ts                ← registers 3 custom elements
    │       ├── utils.ts                ← createShadowRoot, getAttr
    │       ├── styles.css              ← @import tailwindcss (Shadow DOM)
    │       ├── AppElement.tsx          ← <aem-headless-app> with hash router
    │       ├── ArticleListElement.tsx  ← <aem-article-list>
    │       └── ArticleDetailElement.tsx ← <aem-article-detail>
    │
    ├── dist-wc/
    │   └── web-components.js           ← IIFE bundle (Vite output)
    │
    └── out/                            ← static CDN export (npm run build:cdn)
```

---

## 2. Architecture Overview

### Content Provider Layer

All app pages and API routes import exclusively from `@/lib/content` — never from `@/lib/aem` directly. The content provider is selected at startup via the `CONTENT_PROVIDER` environment variable.

```
App pages / API routes
        │
        ▼
  src/lib/content/index.ts   ← selects provider
        │
   ┌────┴────┐
   ▼         ▼
 mock/     aem/
(default)  (adapter wrapping src/lib/aem/)
```

### Mock API Routes (web components in standalone mode)

Web components default to `aem-host=""` (relative URLs). When no AEM host is set, they call the Next.js mock routes which serve the same sample data as the mock content provider:

```
<aem-article-list> (aem-host="")
        │  relative fetch
        ▼
/graphql/execute.json/[...query]/route.ts
        │
        ▼
  ContentProvider (mock)
```

### Data Flow Summary

| Consumer | Import | Provider |
|----------|--------|----------|
| `app/articles/page.tsx` | `@/lib/content` | mock or AEM |
| `app/api/articles/[slug]/route.ts` | `@/lib/content` | mock or AEM |
| `app/graphql/execute.json/[...query]/route.ts` | `@/lib/content` | mock or AEM |
| Web components | relative fetch → Next.js routes | mock or AEM |

---

## 3. Running the Project

No external services required. Everything runs with a single command:

```bash
cd ~/workspace/aem/nextjs-app
nvm use 22
npm install        # only needed once
npm run dev        # → http://localhost:3000
```

The dev server serves both the Next.js app pages and the mock API routes. All content comes from the built-in mock provider.

---

## 4. Environment Variables

### `.env.local` (default — mock mode)

```env
CONTENT_PROVIDER=mock
```

### AEM mode (when reconnecting to a live AEM instance)

```env
CONTENT_PROVIDER=aem

# Required when CONTENT_PROVIDER=aem
NEXT_PUBLIC_AEM_HOST=https://your-aem-publish-host
NEXT_PUBLIC_AEM_GRAPHQL_ENDPOINT=/content/_cq_graphql/aem-headless-demo/endpoint.gql
AEM_BASIC_AUTH=admin:admin        # server-side only — never exposed to client
NEXT_PUBLIC_CDN_URL=              # optional CDN base URL for static asset prefix
```

---

## 5. Build Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server on :3000 (mock content, no AEM needed) |
| `npm run build` | Standard Next.js SSR build |
| `npm run build:cdn` | Static export (`out/`) — requires `BUILD_TARGET=cdn` |
| `npm run build:wc` | Vite IIFE bundle → `dist-wc/web-components.js` |
| `npm run dev:wc` | Vite watch mode for web components |

---

## 6. Custom Elements

| Element | Observed attributes | Description |
|---------|---------------------|-------------|
| `<aem-headless-app>` | `aem-host`, `graphql-endpoint`, `base-path` | Full app with hash router |
| `<aem-article-list>` | `aem-host`, `graphql-endpoint` | Article list |
| `<aem-article-detail>` | `aem-host`, `graphql-endpoint`, `path` | Article detail |

**Standalone (no AEM):** omit `aem-host` (defaults to `""`) so web components fetch from the Next.js mock routes.

**With AEM:** set `aem-host` and `graphql-endpoint` to point at a live AEM Publish instance.

---

## 7. Reconnecting to AEM

The `src/lib/aem/` adapter is fully preserved and wired into the content provider. To switch from mock to live AEM:

1. Update `.env.local`:
   ```env
   CONTENT_PROVIDER=aem
   NEXT_PUBLIC_AEM_HOST=https://your-aem-publish-host
   NEXT_PUBLIC_AEM_GRAPHQL_ENDPOINT=/content/_cq_graphql/aem-headless-demo/endpoint.gql
   AEM_BASIC_AUTH=admin:admin
   ```

2. Ensure the following persisted queries exist in AEM GraphiQL:
   - `all-articles` — returns all article Content Fragments
   - `article-by-path` — accepts `_path` variable

3. Restart the dev server — no code changes required.

---

## 8. Technical Decisions

### Node.js & Vite
- **Node 22** (`.nvmrc = "22"`): required by Vite 8 + rolldown native bindings (`^20.19.0 || >=22.12.0`). Always run `nvm use 22` before `npm install`.
- **Vite 8**: uses rolldown (Rust-based bundler). Web component build: ~860ms.
- `src/web-components/` is excluded from `tsconfig.json` (uses `*.css?inline`, Vite-only syntax). It has its own `tsconfig.wc.json`.

### Web Components & Shadow DOM
- Tailwind 4 is imported as `styles.css?inline` (Vite) and injected as a `<style>` tag into the Shadow DOM — styles are fully isolated from the host page.
- IIFE bundle format — no module loader needed; a single `<script>` tag is sufficient.
- Hash-based routing in `AppElement` (`#/articles/path`) avoids conflicts with AEM page routing.

### Next.js Static Export (CDN mode)
- Activated by `BUILD_TARGET=cdn next build` → `output: 'export'` in `next.config.ts`.
- `[slug]/page.tsx` (server component, exports `generateStaticParams`) + `ArticlePageClient.tsx` (`"use client"`, fetches in `useEffect`) — required because `generateStaticParams` cannot live in a client component.
- Turbopack rejects `generateStaticParams() { return [] }` — a placeholder `[{ slug: "_" }]` is returned instead.

### AEM Maven Project (historical reference)
The `aem-headless-demo/` Maven project has been removed from the filesystem. Key facts preserved for future reference:
- Used AEM Cloud archetype 50 with `includeGraphQL=y`
- Pin `maven-archetype-plugin` to **3.2.1** if regenerating — 3.4.1+ fails on binary GIF assets
- OSGi CORS config must be duplicated in both `config.author/` and `config.publish/`
- Deploy command: `mvn -P autoInstallPackage clean install -D aem.host=localhost -D aem.port=4502`

---

## 9. WordPress Local Environment

A Docker-based WordPress environment for testing web components outside of Next.js.

### Stack
- **WordPress 6** (Apache) on port **8080**
- **MySQL 8** with persistent Docker volume (bind-mounted to `wordpress/db_data/`)
- Both managed via `wordpress/docker-compose.yml`

### Architecture: Microfrontend Shell
WordPress is the **primary frontend shell** — it controls page layout, header, footer, and navigation. Web components are embedded as **microfrontend islands** within WordPress pages.

### Plugins (mu-plugins, auto-loaded)
| Plugin | Purpose |
|--------|---------|
| `mfe-loader.php` | Microfrontend registry, conditional script loading, `[mfe]` shortcode, Gutenberg block |
| `aem-article-cpt.php` | Article CPT mirroring AEM Content Fragment Model |
| `aem-rest-api.php` | `/wp-json/aem/v1/articles` REST API + AEM-compat `/graphql/execute.json/...` aliases |
| `aem-seed-content.php` | One-click demo content seeder |
| `aem-web-components.php` | Legacy shortcodes (superseded by mfe-loader) |

### Theme
`wordpress/themes/aem-starter/` — minimal shell theme with header, footer, nav, Tailwind CDN, and page templates (default, full-width).

### Content Provider Modes
The Next.js app supports three content backends via `CONTENT_PROVIDER` env var:
| Mode | Value | Backend |
|------|-------|---------|
| Mock | `mock` (default) | In-memory data |
| WordPress | `wordpress` | WP REST API at `WORDPRESS_API_URL` |
| AEM | `aem` | AEM GraphQL persisted queries |

### Running
```bash
colima start                           # boot Docker VM
cd wordpress && docker compose up -d   # start WordPress (primary frontend)
# Optional: cd nextjs-app && npm run dev  # standalone dev/preview
```

### Adding New Microfrontends
See `wordpress/MICROFRONTEND_GUIDE.md` — build IIFE bundle → drop in `mfe-bundles/` → register in admin → use in any page.

See `wordpress/README.md` for full setup instructions.

---

## 10. Pending Improvements

- [ ] Upload `dist-wc/web-components.js` to a real CDN (CloudFront, Cloudflare) and update `data-wc-cdn` in the HTL loader
- [ ] CI/CD: auto-build web components on push
- [ ] Bearer token auth support in web components for AEM Publish
- [ ] i18n support in web components (`lang` attribute)
- [ ] Unit tests for Custom Elements
