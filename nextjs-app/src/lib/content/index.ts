import type { ContentProvider } from "./provider";
import { mockProvider } from "./mock";
import { aemProvider } from "./aem";

const CONTENT_PROVIDER = process.env.CONTENT_PROVIDER ?? "mock";

const provider: ContentProvider =
  CONTENT_PROVIDER === "aem" ? aemProvider : mockProvider;

export async function getAllArticles() {
  return provider.getAllArticles();
}

export async function getArticleByPath(path: string) {
  return provider.getArticleByPath(path);
}

export type { ContentProvider } from "./provider";
export type { ArticleModel } from "./types";
