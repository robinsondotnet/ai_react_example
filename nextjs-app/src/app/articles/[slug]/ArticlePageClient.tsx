"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArticleDetail } from "@/components/ArticleDetail";
import { AEMErrorAlert } from "@/components/AEMErrorAlert";
import { toAEMError, httpStatusToError } from "@/lib/aem/errors";
import type { ArticleModel } from "@/lib/aem/types";
import type { AEMRequestError } from "@/lib/aem/errors";
import Link from "next/link";

export default function ArticlePageClient() {
  const params = useParams<{ slug: string }>();
  const path = decodeURIComponent(params?.slug ?? "");

  const [article, setArticle] = useState<ArticleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AEMRequestError | null>(null);

  const fetchArticle = useCallback(() => {
    if (!path || path === "_") return;
    const aemHost = process.env.NEXT_PUBLIC_AEM_HOST ?? "http://localhost:4502";
    const url = `${aemHost}/graphql/execute.json/aem-headless-demo/article-by-path?_path=${encodeURIComponent(path)}`;

    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw httpStatusToError(r.status, url);
        return r.json();
      })
      .then((j) => setArticle(j?.data?.articleByPath?.item ?? null))
      .catch((e: unknown) => setError(toAEMError(e, url)))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

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
          <AEMErrorAlert error={error} onRetry={fetchArticle} />
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
