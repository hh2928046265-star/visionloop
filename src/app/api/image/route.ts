import { NextRequest, NextResponse } from "next/server";
import { imageService } from "@/lib/image-service";

export async function POST(req: NextRequest) {
  try {
    const { prompt, width, height } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "缺少 prompt 参数" }, { status: 400 });
    }

    const result = await imageService.generate(prompt.trim(), width || 512, height || 288);
    return NextResponse.json({ url: result.url, provider: result.provider });
  } catch (err: any) {
    console.error("Image error:", err.message);
    return NextResponse.json({ error: err.message || "图片生成失败" }, { status: 500 });
  }
}