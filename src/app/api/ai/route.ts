import { NextRequest, NextResponse } from "next/server";
import { runThemeAnalysis, runStoryGen, runScriptGen, runShotsGen, MODEL_REGISTRY } from "@/lib/ai";
import type { PipelineContext } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data, modelId, constraints, searchEnabled, customApiKeys } = body;
    const projectType = body.projectType || data?.projectType;

    if (!action) {
      return NextResponse.json({ error: "缺少 action 参数" }, { status: 400 });
    }

    const model = modelId || "qwen2.5-14b";
    const ctx: PipelineContext = { modelId: model, searchEnabled: searchEnabled !== false, customApiKeys };

    switch (action) {
      case "analyze_theme": {
        if (!data?.inputText) {
          return NextResponse.json({ error: "缺少 inputText" }, { status: 400 });
        }
        const result = await runThemeAnalysis(data.inputText, projectType, ctx);
        return NextResponse.json(result);
      }

      case "generate_story": {
        if (!data?.idea) {
          return NextResponse.json({ error: "缺少 idea 数据" }, { status: 400 });
        }
        const result = await runStoryGen(data.idea, constraints, projectType, ctx);
        return NextResponse.json(result);
      }

      case "generate_script": {
        if (!data?.story) {
          return NextResponse.json({ error: "缺少 story 数据" }, { status: 400 });
        }
        const result = await runScriptGen(data.story, constraints, projectType, data.inputText, ctx);
        return NextResponse.json({ scenes: result });
      }

      case "generate_shots": {
        if (!data?.scenes) {
          return NextResponse.json({ error: "缺少 scenes 数据" }, { status: 400 });
        }
        const result = await runShotsGen(data.scenes, constraints, projectType, data.inputText, ctx);
        return NextResponse.json({ shots: result });
      }

      case "generate_image_prompt": {
        if (!data?.shot) {
          return NextResponse.json({ error: "缺少 shot 数据" }, { status: 400 });
        }
        // Build a simple image prompt from shot data
        const shot = data.shot;
        const prompt = [
          shot.shotType || "medium",
          shot.camera?.composition || "",
          shot.lighting?.type || "natural lighting",
          shot.emotion || "",
          shot.subject?.action || "",
          shot.subject?.person || "",
          shot.directorNote || "",
        ].filter(Boolean).join(", ");
        return NextResponse.json({ prompt });
      }

      default:
        return NextResponse.json({ error: "未知 action: " + action }, { status: 400 });
    }
  } catch (err: any) {
    console.error("AI API error:", err.message || err);
    return NextResponse.json(
      { error: err.message || "AI 服务出错，请确认 Ollama 正在运行" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const models = Object.values(MODEL_REGISTRY);
  return NextResponse.json({ models });
}
