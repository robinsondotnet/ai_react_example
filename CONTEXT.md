# AEM Headless + Next.js — CONTEXT.md

> Última actualización: 2026-03-30  
> Estado general: **Frontend 100% completo · Backend bloqueado por licencia AEM**

---

## 1. Árbol de Directorios

```
workspace/aem/
├── CONTEXT.md                          ← este archivo
│
├── nextjs-app/                         ← Frontend Next.js 14
│   ├── .env.example                    ← plantilla de variables (commitear)
│   ├── .env.local                      ← variables locales (NO commitear)
│   ├── .nvmrc                          ← Node 22
│   ├── next.config.ts                  ← config Next.js + modo CDN
│   ├── vite.wc.config.ts               ← config Vite para web components
│   ├── tsconfig.json                   ← excluye src/web-components (Vite-only)
│   ├── tsconfig.wc.json                ← tsconfig para build Vite
│   ├── package.json                    ← engines: node >=22.12.0
│   │
│   ├── src/
│   │   ├── app/                        ← Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                ← home
│   │   │   ├── globals.css
│   │   │   └── articles/
│   │   │       ├── page.tsx            ← listado de artículos (GraphQL SSR)
│   │   │       └── [slug]/
│   │   │           ├── page.tsx        ← wrapper server (generateStaticParams)
│   │   │           └── ArticlePageClient.tsx  ← detalle client-side fetch
│   │   │
│   │   ├── components/
│   │   │   ├── ArticleCard.tsx
│   │   │   └── ArticleDetail.tsx
│   │   │
│   │   ├── lib/aem/
│   │   │   ├── types.ts                ← ArticleModel, respuestas GraphQL
│   │   │   ├── aemHeadlessClient.ts    ← singleton AEMHeadless
│   │   │   ├── graphql.ts              ← getAllArticles, getArticleByPath
│   │   │   └── rest.ts                 ← fetchAEM, getContentModel
│   │   │
│   │   ├── types/
│   │   │   ├── aem-headless-client-js.d.ts   ← tipos manuales del SDK Adobe
│   │   │   └── css-inline.d.ts               ← declara *.css?inline para Vite
│   │   │
│   │   └── web-components/             ← Custom Elements para CDN
│   │       ├── index.ts                ← registra los 3 custom elements
│   │       ├── utils.ts                ← createShadowRoot, getAttr
│   │       ├── styles.css              ← @import tailwindcss (Shadow DOM)
│   │       ├── AppElement.tsx          ← <aem-headless-app> con hash router
│   │       ├── ArticleListElement.tsx  ← <aem-article-list>
│   │       └── ArticleDetailElement.tsx ← <aem-article-detail>
│   │
│   ├── dist-wc/
│   │   └── web-components.js           ← IIFE bundle (267 KB · gzip 81 KB) ✅
│   │
│   └── out/                            ← static export CDN (npm run build:cdn) ✅
│
└── aem-headless-demo/                  ← Backend AEM Maven multi-módulo
    ├── pom.xml                         ← root POM (groupId: com.aem.headless)
    ├── core/                           ← Java OSGi bundle (Sling Models, Servlets)
    ├── ui.apps/
    │   └── .../apps/aem-headless-demo/
    │       ├── clientlibs/
    │       │   ├── clientlib-base/
    │       │   ├── clientlib-site/
    │       │   └── clientlib-headless-wc/  ← ✅ NUEVO
    │       │       ├── .content.xml        ← categoría: aem-headless-demo.headless-wc
    │       │       ├── js.txt
    │       │       └── js/loader.js        ← inyecta bundle CDN idempotente
    │       └── components/
    │           ├── ... (WCM Core)
    │           ├── headlessArticleList/    ← ✅ NUEVO
    │           │   ├── .content.xml
    │           │   ├── headlessArticleList.html
    │           │   └── _cq_dialog/.content.xml
    │           └── headlessArticleDetail/  ← ✅ NUEVO
    │               ├── .content.xml
    │               ├── headlessArticleDetail.html
    │               └── _cq_dialog/.content.xml
    ├── ui.config/
    │   └── .../osgiconfig/
    │       ├── config/
    │       │   └── GraphQlEndpointImpl~aem-headless-demo.cfg.json
    │       ├── config.author/
    │       │   └── CORSPolicyImpl~headless.cfg.json  ← permite localhost:3000
    │       └── config.publish/
    │           └── CORSPolicyImpl~headless.cfg.json
    ├── ui.content/                     ← asset de muestra (asset.jpg)
    ├── dispatcher/                     ← config Apache Dispatcher
    └── all/                            ← paquete agregador para deploy
```

---

## 2. Módulos 100% Funcionales ✅

| Módulo | Comando de verificación | Resultado |
|--------|------------------------|-----------|
| **Web Components IIFE** | `npm run build:wc` | `dist-wc/web-components.js` 267 KB |
| **Next.js static CDN export** | `npm run build:cdn` | `out/` — 6 páginas estáticas |
| **Next.js dev server** | `npm run dev` | `http://localhost:3000` |
| **TypeScript check** | `npx tsc --noEmit` | 0 errores |
| **AEM ClientLib loader** | Deploy AEM → incluir categoría | `clientlib-headless-wc` |
| **HTL headlessArticleList** | Deploy AEM → arrastrar en editor | `<aem-article-list>` |
| **HTL headlessArticleDetail** | Deploy AEM → arrastrar en editor | `<aem-article-detail>` |
| **OSGi CORS** | Deploy AEM | CORS activo en author + publish |
| **GraphQL endpoint OSGi** | Deploy AEM | endpoint `/content/_cq_graphql/...` |

### Custom Elements registrados

| Elemento | Atributos observados | Descripción |
|----------|---------------------|-------------|
| `<aem-headless-app>` | `aem-host`, `graphql-endpoint`, `base-path` | App completa con hash router |
| `<aem-article-list>` | `aem-host`, `graphql-endpoint` | Lista de artículos |
| `<aem-article-detail>` | `aem-host`, `graphql-endpoint`, `path` | Detalle de un CF |

---

## 3. Decisiones Técnicas

### Node.js & Vite
- **Node 22.22.2** (instalado via `nvm install 22`): requerido por Vite 8 + rolldown (`^20.19.0 || >=22.12.0`).
- **Vite 8.0.3**: usa rolldown (bundler nativo en Rust) en lugar de rollup. Significativamente más rápido. Build WC: ~860ms.
- **Problema resuelto con rolldown**: `@rolldown/binding-darwin-x64` es una dependencia opcional nativa. npm la omitía porque ejecutaba npm con Node 20.11.0 (del PATH) en vez de Node 22. Fix: `nvm use 22` antes de `npm install`, o ejecutar `~/.nvm/versions/node/v22.22.2/bin/node npm install`.
- `.nvmrc = "22"` → `nvm use` activa automáticamente v22.22.2.

### Web Components con Shadow DOM
- **Shadow DOM + Tailwind**: Tailwind 4 se importa como `styles.css?inline` (Vite) y se inyecta como `<style>` dentro del shadow root. Esto aísla estilos del host AEM.
- **IIFE format**: no requiere módulo loader en la página AEM. Un único `<script>` es suficiente.
- **Hash router en AppElement**: evita conflicto con el routing de AEM. URLs tipo `#/articles/path`.

### Next.js Static Export (CDN)
- `BUILD_TARGET=cdn next build` activa `output: 'export'` en `next.config.ts`.
- **Problema con Turbopack + `generateStaticParams([])`**: Turbopack (default en Next.js 16) trata un array vacío como "función ausente". Workaround: retornar `[{ slug: "_" }]` como placeholder — genera un shell estático que carga datos client-side.
- **Server/Client split**: `[slug]/page.tsx` (server, exporta `generateStaticParams`) + `ArticlePageClient.tsx` (client, `"use client"`, fetch en `useEffect`). Requerido porque `generateStaticParams` no puede estar en un `"use client"` component.
- `src/web-components/` excluido del `tsconfig.json` de Next.js (usa `*.css?inline` que es sintaxis Vite-only). Tiene su propio `tsconfig.wc.json`.

### AEM Maven Archetype
- **Archetype 50** con `includeGraphQL=y` y `aemVersion=cloud`.
- `maven-archetype-plugin:3.4.1` falla en archetype 50 (Velocity intenta parsear binarios GIF). Fix: pinear a `3.2.1`.

### Adobe AEM SDK
- Requiere licencia de pago o trial de 30 días. Sin versión community.
- Alternativa para dev sin licencia: mockear el endpoint GraphQL localmente.

---

## 4. Próximos Pasos (siguiente sesión)

### Con licencia AEM (flujo completo)

1. **Descargar AEM SDK JAR** desde [experience.adobe.com/downloads](https://experience.adobe.com/downloads)
   ```bash
   mkdir -p ~/aem-sdk/author
   cp ~/Downloads/aem-sdk-quickstart-*.jar ~/aem-sdk/author/aem-author-p4502.jar
   ```

2. **Iniciar AEM Author**
   ```bash
   cd ~/aem-sdk/author
   java -jar aem-author-p4502.jar -r author,localDev -p 4502
   # Esperar ~5 min hasta http://localhost:4502
   ```

3. **Desplegar proyecto Maven**
   ```bash
   cd ~/workspace/aem/aem-headless-demo
   mvn -P autoInstallPackage clean install -D aem.host=localhost -D aem.port=4502
   ```

4. **Crear Content Fragment Model** en AEM Author UI  
   `Tools > Assets > Content Fragment Models > aem-headless-demo`  
   Campos: `title` (Single-line), `body` (Multi-line/Rich text), `author` (Single-line), `publishDate` (Date)

5. **Crear Content Fragments de muestra**  
   `Assets > Files > aem-headless-demo` → crear 2-3 artículos

6. **Persistir queries GraphQL** en GraphiQL (`http://localhost:4502/.../explorer`):
   - `all-articles` → lista todos los artículos
   - `article-by-path` → por variable `_path`

7. **Verificar stack completo**
   ```bash
   cd ~/workspace/aem/nextjs-app && npm run dev
   # Visitar http://localhost:3000
   ```

### Sin licencia AEM (desarrollo local con mock)

1. Crear un servidor mock GraphQL (e.g., con `json-server` o `msw`)
2. Configurar `.env.local`:
   ```
   NEXT_PUBLIC_AEM_HOST=http://localhost:4000
   NEXT_PUBLIC_AEM_GRAPHQL_ENDPOINT=/graphql
   ```

### Mejoras pendientes

- [ ] Subir `dist-wc/web-components.js` a un CDN real (CloudFront, Cloudflare, etc.) y actualizar `data-wc-cdn` en el loader HTL
- [ ] Configurar CI/CD: build automático de web components en cada push
- [ ] Añadir autenticación por token (Bearer) en los Web Components para publish
- [ ] Añadir soporte i18n en los Web Components (`lang` attribute)
- [ ] Tests unitarios para los Custom Elements

---

## Comandos Rápidos

```bash
# Activar Node correcto
nvm use 22

# Dev server Next.js
cd ~/workspace/aem/nextjs-app && npm run dev

# Build Web Components (CDN bundle)
npm run build:wc   # → dist-wc/web-components.js

# Build Static Export (full app en CDN)
npm run build:cdn  # → out/

# Deploy AEM (requiere AEM Author en :4502)
cd ~/workspace/aem/aem-headless-demo
mvn -P autoInstallPackage clean install -D aem.host=localhost -D aem.port=4502
```

## Uso en una página AEM existente

```html
<!-- 1. Incluir ClientLib (en HTL de la página) -->
<sly data-sly-use.clientLib="/libs/granite/sightly/templates/clientlib.html"/>
<div data-sly-call="${clientLib.js @ categories='aem-headless-demo.headless-wc'}"></div>

<!-- El script del ClientLib leerá data-wc-cdn e inyectará el bundle -->
<!-- Asegurarse de que el script tag del ClientLib tiene data-wc-cdn configurado -->

<!-- 2. Usar los Custom Elements -->
<aem-headless-app
  aem-host="https://your-aem-publish-host"
  graphql-endpoint="/content/_cq_graphql/aem-headless-demo/endpoint.gql">
</aem-headless-app>

<!-- O componentes individuales -->
<aem-article-list
  aem-host="https://your-aem-publish-host"
  graphql-endpoint="/content/_cq_graphql/aem-headless-demo/endpoint.gql">
</aem-article-list>
```
