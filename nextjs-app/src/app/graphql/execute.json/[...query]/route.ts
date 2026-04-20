import { NextRequest, NextResponse } from "next/server";
import { getAllArticles, getArticleByPath } from "@/lib/content";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string[] }> }
) {
  const { query } = await params;
  const queryName = query[query.length - 1];

  try {
    if (queryName === "all-articles") {
      const items = await getAllArticles();
      return NextResponse.json(
        { data: { articleList: { items } } },
        { headers: corsHeaders }
      );
    }

    if (queryName === "article-by-path") {
      const path = request.nextUrl.searchParams.get("_path");
      const item = path ? await getArticleByPath(path) : null;
      return NextResponse.json(
        { data: { articleByPath: { item } } },
        { headers: corsHeaders }
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { error: "Unknown persisted query" },
    { status: 404, headers: corsHeaders }
  );
}
