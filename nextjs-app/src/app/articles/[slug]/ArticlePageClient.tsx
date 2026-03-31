"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArticleDetail } from "@/components/ArticleDetail";
import { AEMErrorAlert } from "@/components/AEMErrorAlert";
import type { ArticleModel } from "@/lib/content";
import Link from "next/link";

export default function ArticlePageClient() {
  const params = useParams<{ slug: string }>();
  const path = decodeURIComponent(params?.slug ?? "");

  const [article, setArticle] = useState<ArticleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!path || path === "_") return;
    const url = `/api/articles/${encodeURIComponent(path)}`;
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((j: { article: ArticleModel }) => setArticle(j.article ?? null))
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [path, retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  return (
    <main>
      <div className="max-w-3xl mx-auto pt-8 px-4">
        <Link href="/articles" className="text-sm text-blue-600 hover:underline">
          ← All Articles
        </Link>
      </div>

      {loading && (
        <div className="p-6 text-gray-500 text-sm animate-pulse">Loading…</div>
      )}

      {error && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <AEMErrorAlert error={error} onRetry={handleRetry} />
        </div>
      )}

      {!loading && !error && article && <ArticleDetail article={article} />}

      {!loading && !error && !article && path !== "_" && (
        <div className="max-w-3xl mx-auto px-4 pt-6 text-gray-500 text-sm">
          Article not found. The Content Fragment at{" "}
          <code className="bg-gray-100 px-1 rounded">{path}</code> does not exist.
        </div>
      )}
    </main>
  );
}
