import { NextRequest } from "next/server";
import { GET } from "../route";
import { mockArticles } from "@/lib/content/mock/data";

describe("GET /api/articles/[slug]", () => {
  it("returns article JSON with status 200 for a valid encoded path", async () => {
    const path = mockArticles[0]._path;
    const slug = encodeURIComponent(path);
    const req = new NextRequest(
      `http://localhost:3000/api/articles/${slug}`
    );
    const params = Promise.resolve({ slug });

    const res = await GET(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.article).toBeDefined();
    expect(json.article._path).toBe(path);
    expect(json.article.title).toBe(mockArticles[0].title);
  });

  it("returns 404 for a non-existent path", async () => {
    const slug = encodeURIComponent("/does/not/exist");
    const req = new NextRequest(
      `http://localhost:3000/api/articles/${slug}`
    );
    const params = Promise.resolve({ slug });

    const res = await GET(req, { params });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });

  it("returns the correct article for a known mock path", async () => {
    const article = mockArticles[2];
    const slug = encodeURIComponent(article._path);
    const req = new NextRequest(
      `http://localhost:3000/api/articles/${slug}`
    );
    const params = Promise.resolve({ slug });

    const res = await GET(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.article.title).toBe(article.title);
    expect(json.article.author).toBe(article.author);
  });
});
