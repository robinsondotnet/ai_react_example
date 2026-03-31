import { mockProvider } from "../index";

describe("mockProvider", () => {
  describe("getAllArticles()", () => {
    it("returns an array with 5 articles", async () => {
      const articles = await mockProvider.getAllArticles();
      expect(articles).toHaveLength(5);
    });

    it("each article has required fields", async () => {
      const articles = await mockProvider.getAllArticles();
      for (const article of articles) {
        expect(article).toHaveProperty("_path");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("body.html");
        expect(article).toHaveProperty("body.plaintext");
        expect(article).toHaveProperty("author");
      }
    });

    it("articles have unique _path values", async () => {
      const articles = await mockProvider.getAllArticles();
      const paths = articles.map((a) => a._path);
      expect(new Set(paths).size).toBe(paths.length);
    });
  });

  describe("getArticleByPath()", () => {
    it("returns the correct article for a valid path", async () => {
      const path =
        "/content/dam/aem-headless-demo/articles/building-design-systems-at-scale";
      const article = await mockProvider.getArticleByPath(path);
      expect(article).not.toBeNull();
      expect(article!._path).toBe(path);
      expect(article!.title).toBe("Building Design Systems at Scale");
    });

    it("returns null for a non-existent path", async () => {
      const article = await mockProvider.getArticleByPath("/does/not/exist");
      expect(article).toBeNull();
    });
  });
});
