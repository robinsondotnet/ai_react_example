# WordPress Local Environment

WordPress-as-a-microfrontend-shell: a local Docker environment where WordPress controls the page layout and global components (header, footer, nav), and web component bundles are embedded as microfrontend islands.

## Prerequisites

- [colima](https://github.com/abiosoft/colima) + Docker CLI (installed via Homebrew)
- Optionally: Next.js dev server on port 3000 (for `CONTENT_PROVIDER=wordpress` mode)

## Quick Start

```bash
# 1. Start the Docker VM (if not already running)
colima start

# 2. Start WordPress + MySQL
cd wordpress
docker compose up -d

# 3. Open http://localhost:8080 and complete the WordPress install wizard

# 4. In WP Admin → Settings → Microfrontends — verify aem-articles bundle is registered

# 5. In WP Admin → top banner, click "Seed Demo Content" to import sample articles + pages

# 6. In WP Admin → Appearance → Themes — activate "AEM Starter" theme
```

WordPress will be available at **http://localhost:8080**.

## Architecture

```
WordPress (port 8080) — PRIMARY FRONTEND SHELL
├── Theme (aem-starter): header, footer, nav, page templates
├── Pages with microfrontend islands via [mfe] shortcode
├── Article CPT: content authoring (mirrors AEM Content Fragments)
├── REST API: /wp-json/aem/v1/articles (for Next.js)
├── AEM-compat routes: /graphql/execute.json/... (for web components)
└── MFE Loader: registry for microfrontend bundles
```

## Plugins (mu-plugins — auto-loaded)

| Plugin | Purpose |
|--------|---------|
| `mfe-loader.php` | Microfrontend registry, script loading, `[mfe]` shortcode, Gutenberg block |
| `aem-article-cpt.php` | Article custom post type with AEM-matching fields |
| `aem-rest-api.php` | REST API endpoints + AEM-compatible URL aliases |
| `aem-seed-content.php` | One-click demo content import |
| `aem-web-components.php` | Legacy shortcodes (superseded by mfe-loader) |

## Content Authoring

Articles are managed via WP Admin → Articles. Each article has:
- **Title** — article headline
- **AEM Path** — auto-generated: `/content/dam/aem-headless-demo/articles/{slug}`
- **Body HTML / Plaintext** — rich and plain text versions
- **Author Name** — content author
- **Publish Date** — ISO 8601 timestamp
- **Article Tags** — taxonomy tags

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /wp-json/aem/v1/articles` | List all articles as `ArticleModel[]` |
| `GET /wp-json/aem/v1/articles/{path}` | Single article by AEM path |
| `GET /graphql/execute.json/aem-headless-demo/all-articles` | AEM-compat: all articles |
| `GET /graphql/execute.json/aem-headless-demo/article-by-path?_path=...` | AEM-compat: single article |

## Using Microfrontends in Pages

**Shortcode:**
```
[mfe element="aem-headless-app"]
[mfe element="aem-article-list"]
[mfe element="aem-article-detail" attrs="path=/content/dam/aem-headless-demo/articles/my-article"]
```

**Gutenberg:** Add an "MFE Component" block and configure element name + attributes.

## Adding a New Microfrontend

See `MICROFRONTEND_GUIDE.md` for the full walkthrough.

## Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start WordPress + MySQL |
| `docker compose down` | Stop containers |
| `docker compose down -v` | Stop and **delete all data** |
| `docker compose logs -f wordpress` | Tail logs |
