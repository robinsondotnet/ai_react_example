import { getAEMClient } from "./aemHeadlessClient";
import type { ArticleListResponse, ArticleByPathResponse, ArticleModel } from "./types";
import { toAEMError, httpStatusToError } from "./errors";

const AEM_HOST = process.env.NEXT_PUBLIC_AEM_HOST ?? "http://localhost:4502";

function resolvePersistedQueryUrl(queryPath: string): string {
  return `${AEM_HOST}/graphql/execute.json/${queryPath}`;
}

/**
 * Fetch all articles using a persisted GraphQL query.
 * Persisted query must exist at: /graphql/execute.json/aem-headless-demo/all-articles
 */
export async function getAllArticles(): Promise<ArticleModel[]> {
  const url = resolvePersistedQueryUrl("aem-headless-demo/all-articles");
  const client = getAEMClient();
  try {
    const { data, errors } = await client.runPersistedQuery<ArticleListResponse>(
      "aem-headless-demo/all-articles"
    );
    if (errors?.length) {
      const first = errors[0];
      const status: number | undefined = (first as { status?: number }).status;
      if (status) throw httpStatusToError(status, url);
      throw toAEMError(new Error(first.message ?? "GraphQL error"), url);
    }
    return data?.articleList?.items ?? [];
  } catch (e) {
    throw toAEMError(e, url);
  }
}

/**
 * Fetch a single article by its JCR path using a persisted GraphQL query.
 * Persisted query must exist at: /graphql/execute.json/aem-headless-demo/article-by-path
 */
export async function getArticleByPath(path: string): Promise<ArticleModel | null> {
  const url = resolvePersistedQueryUrl("aem-headless-demo/article-by-path");
  const client = getAEMClient();
  try {
    const { data, errors } = await client.runPersistedQuery<ArticleByPathResponse>(
      "aem-headless-demo/article-by-path",
      { _path: path }
    );
    if (errors?.length) {
      const first = errors[0];
      const status: number | undefined = (first as { status?: number }).status;
      if (status) throw httpStatusToError(status, url);
      throw toAEMError(new Error(first.message ?? "GraphQL error"), url);
    }
    return data?.articleByPath?.item ?? null;
  } catch (e) {
    throw toAEMError(e, url);
  }
}
