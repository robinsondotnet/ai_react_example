import type { ArticleModel } from "@/lib/aem/types";

interface ArticleDetailProps {
  article: ArticleModel;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <article className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-3">{article.title}</h1>
      <p className="text-sm text-gray-500 mb-8">
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

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {article.body?.html ? (
        <div
          className="prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: article.body.html }}
        />
      ) : (
        <p className="text-gray-700 whitespace-pre-line">{article.body?.plaintext}</p>
      )}
    </article>
  );
}
