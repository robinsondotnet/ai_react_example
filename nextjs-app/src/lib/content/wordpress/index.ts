import type { ContentProvider } from "../provider";
import type { ArticleModel } from "../types";

const WP_API_URL = process.env.WORDPRESS_API_URL ?? "http://localhost:8080";

export const wordpressProvider: ContentProvider = {
  async getAllArticles(): Promise<ArticleModel[]> {
    const res = await fetch(`${WP_API_URL}/wp-json/aem/v1/articles`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`WordPress API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  async getArticleByPath(path: string): Promise<ArticleModel | null> {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const res = await fetch(
      `${WP_API_URL}/wp-json/aem/v1/articles${cleanPath}`,
      { next: { revalidate: 60 } }
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`WordPress API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
};
