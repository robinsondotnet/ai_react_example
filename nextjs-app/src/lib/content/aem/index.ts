import type { ContentProvider } from "../provider";
import { getAllArticles as aemGetAllArticles, getArticleByPath as aemGetArticleByPath } from "@/lib/aem/graphql";

export const aemProvider: ContentProvider = {
  async getAllArticles() {
    return aemGetAllArticles();
  },
  async getArticleByPath(path: string) {
    return aemGetArticleByPath(path);
  },
};
