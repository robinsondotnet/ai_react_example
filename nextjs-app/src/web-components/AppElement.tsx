import React, { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createShadowRoot, getAttr } from "./utils";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleDetail } from "@/components/ArticleDetail";
import type { ArticleModel } from "@/lib/aem/types";
import styles from "./styles.css?inline";

interface AppProps {
  aemHost: string;
  graphqlEndpoint: string;
  basePath: string;
}

function HashRouter({ aemHost, graphqlEndpoint }: AppProps) {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Routes: #/ or #/articles  →  list | #/articles/:encodedPath  →  detail
  const articleMatch = hash.match(/^#\/articles\/(.+)$/);

  if (articleMatch) {
    const path = decodeURIComponent(articleMatch[1]);
    return <ArticleDetailRoute path={path} aemHost={aemHost} graphqlEndpoint={graphqlEndpoint} />;
  }

  return <ArticleListRoute aemHost={aemHost} graphqlEndpoint={graphqlEndpoint} />;
}

function ArticleListRoute({ aemHost }: { aemHost: string; graphqlEndpoint: string }) {
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = "Basic " + btoa("admin:admin");
    fetch(`${aemHost}/graphql/execute.json/aem-headless-demo/all-articles`, {
      headers: { Authorization: auth },
    })
      .then((r) => r.json())
      .then((j) => setArticles(j?.data?.articleList?.items ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [aemHost]);

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading articles…</div>;
  if (error) return <div className="p-4 text-red-700 text-sm bg-red-50 rounded-lg border border-red-200">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Articles</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <ArticleCard key={a._path} article={a} />
        ))}
      </div>
    </div>
  );
}

function ArticleDetailRoute({
  path,
  aemHost,
  graphqlEndpoint,
}: {
  path: string;
  aemHost: string;
  graphqlEndpoint: string;
}) {
  const [article, setArticle] = useState<ArticleModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = "Basic " + btoa("admin:admin");
    fetch(
      `${aemHost}/graphql/execute.json/aem-headless-demo/article-by-path?_path=${encodeURIComponent(path)}`,
      { headers: { Authorization: auth } }
    )
      .then((r) => r.json())
      .then((j) => setArticle(j?.data?.articleByPath?.item ?? null))
      .finally(() => setLoading(false));
  }, [path, aemHost]);

  return (
    <div className="p-4">
      <button
        className="text-sm text-blue-600 hover:underline mb-4 block"
        onClick={() => (window.location.hash = "#/articles")}
      >
        ← All Articles
      </button>
      {loading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : article ? (
        <ArticleDetail article={article} />
      ) : (
        <div className="text-gray-500 text-sm">Article not found.</div>
      )}
    </div>
  );
}

export class AppElement extends HTMLElement {
  private root: Root | null = null;

  connectedCallback() {
    const container = createShadowRoot(this, styles);
    this.root = createRoot(container);
    this.render();
  }

  disconnectedCallback() {
    this.root?.unmount();
  }

  static get observedAttributes() {
    return ["aem-host", "graphql-endpoint", "base-path"];
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    if (!this.root) return;
    this.root.render(
      <React.StrictMode>
        <HashRouter
          aemHost={getAttr(this, "aem-host", "http://localhost:4502")}
          graphqlEndpoint={getAttr(
            this,
            "graphql-endpoint",
            "/content/_cq_graphql/aem-headless-demo/endpoint.gql"
          )}
          basePath={getAttr(this, "base-path", "/")}
        />
      </React.StrictMode>
    );
  }
}
