import { NextRequest } from "next/server";
import { GET } from "../route";
import { mockArticles } from "@/lib/content/mock/data";

describe("GET /graphql/execute.json/[...query]", () => {
  it("all-articles returns article list with status 200", async () => {
    const req = new NextRequest(
      "http://localhost:3000/graphql/execute.json/aem-headless-demo/all-articles"
    );
    const params = Promise.resolve({
      query: ["aem-headless-demo", "all-articles"],
    });

    const res = await GET(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.articleList.items).toHaveLength(mockArticles.length);
  });

  it("article-by-path with valid _path returns the article", async () => {
    const path = mockArticles[0]._path;
    const req = new NextRequest(
      `http://localhost:3000/graphql/execute.json/aem-headless-demo/article-by-path?_path=${encodeURIComponent(path)}`
    );
    const params = Promise.resolve({
      query: ["aem-headless-demo", "article-by-path"],
    });

    const res = await GET(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.articleByPath.item).not.toBeNull();
    expect(json.data.articleByPath.item._path).toBe(path);
  });

  it("article-by-path with non-existent _path returns item as null", async () => {
    const req = new NextRequest(
      "http://localhost:3000/graphql/execute.json/aem-headless-demo/article-by-path?_path=/does/not/exist"
    );
    const params = Promise.resolve({
      query: ["aem-headless-demo", "article-by-path"],
    });

    const res = await GET(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.articleByPath.item).toBeNull();
  });

  it("unknown query name returns 404", async () => {
    const req = new NextRequest(
      "http://localhost:3000/graphql/execute.json/aem-headless-demo/unknown-query"
    );
    const params = Promise.resolve({
      query: ["aem-headless-demo", "unknown-query"],
    });

    const res = await GET(req, { params });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
