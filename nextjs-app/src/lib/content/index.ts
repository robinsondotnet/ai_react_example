import type { ContentProvider } from "./provider";
import { mockProvider } from "./mock";
import { aemProvider } from "./aem";
import { wordpressProvider } from "./wordpress";

const CONTENT_PROVIDER = process.env.CONTENT_PROVIDER ?? "mock";

function selectProvider(): ContentProvider {
  switch (CONTENT_PROVIDER) {
    case "aem":
      return aemProvider;
    case "wordpress":
      return wordpressProvider;
    default:
      return mockProvider;
  }
}

const provider = selectProvider();

export async function getAllArticles() {
  return provider.getAllArticles();
}

export async function getArticleByPath(path: string) {
  return provider.getArticleByPath(path);
}

export type { ContentProvider } from "./provider";
export type { ArticleModel } from "./types";
