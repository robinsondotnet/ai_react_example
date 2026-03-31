import type { ContentProvider } from "../provider";
import type { ArticleModel } from "../types";
import { mockArticles } from "./data";

export const mockProvider: ContentProvider = {
  async getAllArticles(): Promise<ArticleModel[]> {
    return mockArticles;
  },
  async getArticleByPath(path: string): Promise<ArticleModel | null> {
    return mockArticles.find(a => a._path === path) ?? null;
  },
};
