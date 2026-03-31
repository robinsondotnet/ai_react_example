import ArticlePageClient from "./ArticlePageClient";

// Required for static export (output: 'export').
// Returns empty array — in CDN mode, pages load data client-side at runtime.
export async function generateStaticParams() {
  // Return a placeholder so Turbopack generates a static shell for this route.
  // Actual articles are fetched client-side at runtime via GraphQL.
  return [{ slug: "_" }];
}

export const dynamicParams = false;

export default function ArticlePage() {
  return <ArticlePageClient />;
}
