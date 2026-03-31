import { NextRequest, NextResponse } from "next/server";
import { mockArticles } from "@/lib/content/mock/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string[] }> }
) {
  const { query } = await params;
  const queryName = query[query.length - 1];

  if (queryName === "all-articles") {
    return NextResponse.json({
      data: { articleList: { items: mockArticles } },
    });
  }

  if (queryName === "article-by-path") {
    const path = request.nextUrl.searchParams.get("_path");
    const item = mockArticles.find((a) => a._path === path) ?? null;
    return NextResponse.json({
      data: { articleByPath: { item } },
    });
  }

  return NextResponse.json({ error: "Unknown persisted query" }, { status: 404 });
}
