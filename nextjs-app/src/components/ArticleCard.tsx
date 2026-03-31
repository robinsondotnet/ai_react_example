import Link from "next/link";
import type { ArticleModel } from "@/lib/aem/types";

interface ArticleCardProps {
  article: ArticleModel;
}

export function ArticleCard({ article }: ArticleCardProps) {
  // Derive a URL-safe slug from the JCR path
  const slug = encodeURIComponent(article._path);

  return (
    <article className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      <h2 className="text-xl font-semibold mb-1">
        <Link
          href={`/articles/${slug}`}
          className="text-blue-700 hover:underline"
        >
          {article.title}
        </Link>
      </h2>
      <p className="text-sm text-gray-500 mb-3">
        By {article.author}
        {article.publishDate && (
          <>
            {" · "}
            {new Date(article.publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </>
        )}
      </p>
      {article.body?.plaintext && (
        <p className="text-gray-700 line-clamp-3 text-sm">
          {article.body.plaintext}
        </p>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-3 py-0.5 text-xs text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
