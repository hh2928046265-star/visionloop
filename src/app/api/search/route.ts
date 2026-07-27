import { NextRequest, NextResponse } from "next/server";
import { searchWeb } from "@/lib/search/web-search";

export async function POST(req: NextRequest) {
  try {
    const { query, maxResults } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "缺少搜索关键词" }, { status: 400 });
    }
    const result = await searchWeb(query, maxResults || 5);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "搜索失败" }, { status: 500 });
  }
}
