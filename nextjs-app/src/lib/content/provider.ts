import type { ArticleModel } from "./types";

export interface ContentProvider {
  getAllArticles(): Promise<ArticleModel[]>;
  getArticleByPath(path: string): Promise<ArticleModel | null>;
}
