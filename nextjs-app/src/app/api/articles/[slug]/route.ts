import { NextRequest, NextResponse } from "next/server";
import { getArticleByPath } from "@/lib/content";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const path = decodeURIComponent(slug);

  try {
    const article = await getArticleByPath(path);
    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ article }, { headers: corsHeaders });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
