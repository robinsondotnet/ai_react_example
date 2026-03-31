# GitHub Copilot Instructions — AEM Headless + Next.js

This workspace contains a full AEM headless stack: a Next.js 14 frontend and an AEM Cloud Service Maven project. Read these instructions before generating any code.

---

## Project Structure

```
workspace/aem/
├── nextjs-app/          # Next.js 14 frontend (App Router, TypeScript, Tailwind 4)
└── aem-headless-demo/   # AEM Maven multi-module project (archetype 50, Cloud)
```

---

## nextjs-app — Frontend Rules

### Runtime
- **Node**: `>=22.12.0` (use `nvm use 22` before any npm command)
- **Package manager**: npm only — do not suggest yarn or pnpm
- **Install**: always run `nvm use 22 && npm install` together; never run npm under a different Node version or rolldown native bindings will be missing

### Framework & Conventions
- **Next.js 16** with **App Router** — do NOT use Pages Router patterns
- All pages live under `src/app/`; components under `src/components/`; AEM utilities under `src/lib/aem/`
- Use `@/` alias for all imports from `src/` (configured in `tsconfig.json`)
- **TypeScript strict mode** is enabled — all code must type-check with `npx tsc --noEmit`
- `@adobe/aem-headless-client-js` has no bundled types — declarations are in `src/types/aem-headless-client-js.d.ts`; do not re-declare

### Styling
- **Tailwind CSS 4** with `@tailwindcss/postcss`; do NOT use `tailwind.config.js` (Tailwind 4 uses CSS-first config)
- In web components, Tailwind is injected as a `<style>` tag into the Shadow DOM — never add global CSS that assumes access to the host page

### AEM Data Layer (`src/lib/aem/`)
- `aemHeadlessClient.ts` — singleton factory; import from here, do not instantiate `AEMHeadless` directly
- `graphql.ts` — all GraphQL persisted query calls (`getAllArticles`, `getArticleByPath`)
- `rest.ts` — Sling Model Exporter REST helpers
- `types.ts` — `ArticleModel`, response types; extend here, do not inline types in components

### Web Components (`src/web-components/`)
- These files are built by **Vite 8**, NOT Next.js — they use `*.css?inline` syntax which is Vite-only
- `src/web-components/` is **excluded** from `tsconfig.json`; it has its own `tsconfig.wc.json`
- Do not import anything from `src/web-components/` inside Next.js app pages or components
- Custom elements: `<aem-headless-app>`, `<aem-article-list>`, `<aem-article-detail>`
- All elements use Shadow DOM — Tailwind CSS is injected via `createShadowRoot()` in `utils.ts`
- Routing in `AppElement` uses hash-based navigation (`window.location.hash`) to avoid AEM URL conflicts

### Build Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server on :3000 |
| `npm run build` | Standard Next.js SSR build |
| `npm run build:cdn` | Static export (`out/`) — requires `BUILD_TARGET=cdn` |
| `npm run build:wc` | Vite IIFE bundle → `dist-wc/web-components.js` |
| `npm run dev:wc` | Vite watch mode for web components |

### Static Export (`output: 'export'`)
- Activated when `BUILD_TARGET=cdn`
- Dynamic routes (`[slug]`) **must** export `generateStaticParams()` from a **server component**
- `generateStaticParams` cannot be in a `"use client"` component — use a server wrapper + client child pattern
- Turbopack (default in Next.js 16) rejects `generateStaticParams() { return [] }` — return at least one placeholder: `[{ slug: "_" }]`
- `revalidate` is not supported in static export mode

### Environment Variables
```
NEXT_PUBLIC_AEM_HOST           # AEM host (author or publish)
NEXT_PUBLIC_AEM_GRAPHQL_ENDPOINT  # GraphQL endpoint path
AEM_BASIC_AUTH                 # user:password (server-side only, never expose to client)
NEXT_PUBLIC_CDN_URL            # CDN base URL for static asset prefix
```

---

## aem-headless-demo — AEM Maven Rules

### Java
- **Java 11 only** — AEM Cloud SDK does not support Java 17 or 21
- `JAVA_HOME` must point to Java 11: `export JAVA_HOME=$(brew --prefix openjdk@11)`

### Maven Archetype
- Uses **AEM archetype 50** with `includeGraphQL=y` and `aemVersion=cloud`
- Always pin `maven-archetype-plugin` to **3.2.1** when regenerating — version 3.4.1+ fails on binary GIF assets in the archetype
- Never regenerate into an existing directory without deleting it first

### Module Structure
| Module | Purpose |
|--------|---------|
| `core/` | Java OSGi bundle (Sling Models, Servlets, Filters) |
| `ui.apps/` | JCR content: components, clientlibs, templates |
| `ui.config/` | OSGi configurations (.cfg.json files) |
| `ui.content/` | Content packages (DAM assets, initial content) |
| `all/` | Aggregator — deploys everything together |
| `dispatcher/` | Apache Dispatcher config |

### OSGi Configs
- Path pattern: `ui.config/src/main/content/jcr_root/apps/aem-headless-demo/osgiconfig/config.{author|publish|}/`
- CORS is configured in both `config.author/` and `config.publish/` — always update both
- GraphQL endpoint: `com.adobe.cq.dam.cfm.graphql.endpoint.impl.GraphQlEndpointImpl~aem-headless-demo.cfg.json`

### Components & ClientLibs
- Components live in `ui.apps/.../apps/aem-headless-demo/components/`
- ClientLibs live in `ui.apps/.../apps/aem-headless-demo/clientlibs/`
- HTL (Sightly) templates use `.html` extension
- Component dialogs use `_cq_dialog/.content.xml` with Granite UI field definitions
- The `clientlib-headless-wc` category is `aem-headless-demo.headless-wc`

### Web Component Integration in AEM
The `loader.js` in `clientlib-headless-wc` reads `data-wc-cdn` from its own `<script>` tag and injects the IIFE bundle from CDN. Example HTL usage:

```html
<sly data-sly-use.clientLib="/libs/granite/sightly/templates/clientlib.html"/>
<div data-sly-call="${clientLib.js @ categories='aem-headless-demo.headless-wc'}"></div>

<aem-article-list
  aem-host="${properties.aemHost @ context='attribute'}"
  graphql-endpoint="${properties.graphqlEndpoint @ context='attribute'}">
</aem-article-list>
```

### Deploy Command
```bash
cd ~/workspace/aem/aem-headless-demo
mvn -P autoInstallPackage clean install -D aem.host=localhost -D aem.port=4502
```

---

## Cross-Cutting Rules

- **Never commit** `.env.local`, AEM SDK JARs, `dist-wc/`, `out/`, `node_modules/`, or `target/`
- **CORS**: the OSGi CORS policy allows `http://localhost:3000` — add new origins to both `config.author` and `config.publish`
- **GraphQL persisted queries** must be created in the AEM Author UI (GraphiQL) before they can be called from the frontend — the query names `all-articles` and `article-by-path` are assumed by `src/lib/aem/graphql.ts`
- When adding a new AEM GraphQL field, update `ArticleModel` in `src/lib/aem/types.ts`
- Keep `CONTEXT.md` at the workspace root up to date after major changes
