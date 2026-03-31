import React, { useCallback, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createShadowRoot, getAttr } from "./utils";
import { ArticleCard } from "@/components/ArticleCard";
import { AEMErrorAlert } from "@/components/AEMErrorAlert";
import { httpStatusToError, toAEMError } from "@/lib/aem/errors";
import type { AEMRequestError } from "@/lib/aem/errors";
import type { ArticleModel } from "@/lib/aem/types";
import styles from "./styles.css?inline";

interface Props {
  aemHost: string;
  graphqlEndpoint: string;
}

function ArticleListWidget({ aemHost, graphqlEndpoint }: Props) {
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [error, setError] = useState<AEMRequestError | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(() => {
    const url = `${aemHost}/graphql/execute.json/aem-headless-demo/all-articles`;
    const auth = "Basic " + btoa("admin:admin");

    setLoading(true);
    setError(null);

    fetch(url, { headers: { Authorization: auth } })
      .then((r) => {
        if (!r.ok) throw httpStatusToError(r.status, url);
        return r.json();
      })
      .then((json) => setArticles(json?.data?.articleList?.items ?? []))
      .catch((e: unknown) => setError(toAEMError(e, url)))
      .finally(() => setLoading(false));
  }, [aemHost, graphqlEndpoint]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-zinc-500 text-sm">
        <span className="animate-pulse">Loading articles…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <AEMErrorAlert error={error} onRetry={fetchArticles} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 p-4">
      {articles.map((article) => (
        <ArticleCard key={article._path} article={article} />
      ))}
    </div>
  );
}

export class ArticleListElement extends HTMLElement {
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
    return ["aem-host", "graphql-endpoint"];
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    if (!this.root) return;
    this.root.render(
      <React.StrictMode>
        <ArticleListWidget
          aemHost={getAttr(this, "aem-host", "http://localhost:4502")}
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

