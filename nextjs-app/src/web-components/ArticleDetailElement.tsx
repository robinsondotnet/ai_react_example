import React, { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createShadowRoot, getAttr } from "./utils";
import { ArticleDetail } from "@/components/ArticleDetail";
import type { ArticleModel } from "@/lib/aem/types";
import styles from "./styles.css?inline";

interface Props {
  path: string;
  aemHost: string;
  graphqlEndpoint: string;
}

function ArticleDetailWidget({ path, aemHost }: Props) {
  const [article, setArticle] = useState<ArticleModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) return;

    const baseUrl = aemHost || "";
    const endpoint = `${baseUrl}/graphql/execute.json/aem-headless-demo/article-by-path`;

    fetch(`${endpoint}?_path=${encodeURIComponent(path)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setArticle(json?.data?.articleByPath?.item ?? null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [path, aemHost]);

  // Guard missing path in render — avoids synchronous setState in effect
  if (!path) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
        No Content Fragment path provided (set the &apos;path&apos; attribute).
      </div>
    );
  }

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading…</div>;

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!article) {
    return <div className="p-6 text-gray-500 text-sm">Article not found.</div>;
  }

  return <ArticleDetail article={article} />;
}

export class ArticleDetailElement extends HTMLElement {
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
    return ["path", "aem-host", "graphql-endpoint"];
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    if (!this.root) return;
    this.root.render(
      <React.StrictMode>
        <ArticleDetailWidget
          path={getAttr(this, "path")}
          aemHost={getAttr(this, "aem-host", "")}
          graphqlEndpoint={getAttr(
            this,
            "graphql-endpoint",
            "/content/_cq_graphql/aem-headless-demo/endpoint.gql"
          )}
        />
      </React.StrictMode>
    );
  }
}
