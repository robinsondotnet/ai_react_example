import Link from "next/link";
import { getAllArticles } from "@/lib/aem/graphql";
import { ArticleCard } from "@/components/ArticleCard";
import { AEMErrorAlert } from "@/components/AEMErrorAlert";
import type { ArticleModel } from "@/lib/aem/types";
import type { AEMRequestError } from "@/lib/aem/errors";

export const revalidate = 60;

export default async function ArticlesPage() {
  let articles: ArticleModel[] = [];
  let error: AEMRequestError | null = null;

  try {
    articles = await getAllArticles();
  } catch (e) {
    const { toAEMError } = await import("@/lib/aem/errors");
    error = toAEMError(e);
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Home
        </Link>
      </div>

      {error && (
        <div className="mb-8">
          <AEMErrorAlert error={error} />
          <p className="mt-3 pl-6 text-xs text-zinc-500">
            <a
              href="/articles"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75V6.75a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1 0-1.5h2.588a3.517 3.517 0 0 0-5.468-.588.75.75 0 1 1-1.078-1.044A5.017 5.017 0 0 1 14.25 6.65V3.227a.75.75 0 0 1-.414-.75ZM1.75 9.5a.75.75 0 0 1 .75-.75H6.25a.75.75 0 0 1 0 1.5H3.662a3.517 3.517 0 0 0 5.468.588.75.75 0 1 1 1.078 1.044A5.017 5.017 0 0 1 1.75 9.35V9.5Z" clipRule="evenodd" />
              </svg>
              Refresh page
            </a>
          </p>
        </div>
      )}

      {articles.length === 0 && !error && (
        <p className="text-gray-500">
          No articles found. Create Content Fragments in AEM and publish a persisted
          query named <code>aem-headless-demo/all-articles</code>.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article._path} article={article} />
        ))}
      </div>
    </main>
  );
}
