// VisionLoop - 多后端图片生成服务
// Pollinations AI (免费) + 本地 Fooocus (预留)

interface ImageProvider {
  name: string;
  generate(prompt: string, width?: number, height?: number): Promise<{ url: string }>;
  isAvailable(): boolean;
}

export interface ImageResult {
  url: string;
  provider: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  currentShot: number;
  status: "idle" | "generating" | "done" | "error";
  errors: string[];
}

// Provider 1: Pollinations AI (免费)
class PollinationsProvider implements ImageProvider {
  name = "pollinations";
  isAvailable(): boolean { return true; }
  async generate(prompt: string, width: number = 512, height: number = 288): Promise<{ url: string }> {
    const parts = [
      "https://image.pollinations.ai/prompt/",
      encodeURIComponent(prompt),
      "?width=", String(width),
      "&height=", String(height),
      "&model=turbo",
      "&nologo=true",
      "&seed=", String(Math.floor(Math.random() * 999999)),
    ];
    const pollUrl = parts.join("");
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45000);
    try {
      const res = await fetch(pollUrl, { signal: ctrl.signal, headers: { "User-Agent": "StoryboardStudio/1.0" } });
      if (!res.ok) {
        if (res.status === 429) throw new Error("RATE_LIMIT");
        throw new Error("HTTP " + res.status);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 500) throw new Error("IMAGE_TOO_SMALL");
      // Black image detection
      let nonBlack = 0;
      const step = Math.max(1, Math.floor(buf.length / 1000));
      for (let i = 0; i < buf.length; i += step) { if (buf[i] > 30) nonBlack++; }
      if (nonBlack < 5) throw new Error("BLACK_IMAGE");
      return { url: "data:image/jpeg;base64," + buf.toString("base64") };
    } finally { clearTimeout(t); }
  }
}

// Provider 2: Fooocus 本地 (预留)
class FooocusProvider implements ImageProvider {
  name = "fooocus";
  isAvailable(): boolean { return false; }
  async generate(): Promise<{ url: string }> {
    throw new Error("Fooocus not available");
  }
}

// 主服务类
class ImageService {
  private providers: ImageProvider[] = [new PollinationsProvider(), new FooocusProvider()];

  async generate(prompt: string, width?: number, height?: number): Promise<ImageResult> {
    const errors: string[] = [];
    for (const provider of this.providers) {
      if (!provider.isAvailable()) { errors.push(provider.name + ": unavailable"); continue; }
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          if (attempt > 0) {
            const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
            console.log("[" + provider.name + "] Retry " + (attempt + 1) + "/5, wait " + delay + "ms");
            await new Promise(r => setTimeout(r, delay));
          }
          const result = await provider.generate(prompt, width, height);
          console.log("[" + provider.name + "] Success");
          return { url: result.url, provider: provider.name };
        } catch (e: any) {
          const msg = e.message || String(e);
          console.warn("[" + provider.name + "] Attempt " + (attempt + 1) + " failed: " + msg);
          if (msg === "BLACK_IMAGE" || msg === "RATE_LIMIT" || msg === "IMAGE_TOO_SMALL") continue;
          errors.push(provider.name + ": " + msg); break;
        }
      }
    }
    throw new Error("All providers failed: " + errors.join("; "));
  }

  async generateBatch(
    prompts: Array<{ id: number; prompt: string; width?: number; height?: number }>,
    onProgress?: (p: BatchProgress) => void
  ): Promise<Record<number, string>> {
    const results: Record<number, string> = {};
    const errs: string[] = [];
    const progress: BatchProgress = {
      total: prompts.length, completed: 0, currentShot: 0,
      status: "generating", errors: [],
    };
    for (let i = 0; i < prompts.length; i++) {
      const p = prompts[i];
      progress.currentShot = p.id;
      onProgress?.(progress);
      try { const r = await this.generate(p.prompt, p.width, p.height); results[p.id] = r.url; }
      catch (e: any) { errs.push("#" + p.id + ": " + (e.message || String(e))); progress.errors = errs; }
      progress.completed = i + 1;
      onProgress?.(progress);
      if (i < prompts.length - 1) await new Promise(r => setTimeout(r, 2500));
    }
    progress.status = errs.length === prompts.length ? "error" : "done";
    onProgress?.(progress);
    return results;
  }
}

export const imageService = new ImageService();

export async function generateStoryboardImage(prompt: string, w?: number, h?: number): Promise<string> {
  const r = await imageService.generate(prompt, w, h);
  return r.url;
}

export async function generateBatchImages(
  prompts: Array<{ id: number; prompt: string; width?: number; height?: number }>,
  onProgress?: (p: BatchProgress) => void
): Promise<Record<number, string>> {
  return imageService.generateBatch(prompts, onProgress);
}
// ============================================================
// Browser-safe wrapper — routes through our server API
// ============================================================
export async function generateBatchImagesBrowser(
  prompts: Array<{ id: number; prompt: string; width?: number; height?: number }>,
  onProgress?: (p: BatchProgress) => void
): Promise<Record<number, string>> {
  const results: Record<number, string> = {};
  const errs: string[] = [];
  const progress: BatchProgress = {
    total: prompts.length, completed: 0, currentShot: 0,
    status: "generating", errors: [],
  };
  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    progress.currentShot = p.id;
    onProgress?.(progress);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p.prompt, width: p.width || 864, height: p.height || 486 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "HTTP " + res.status);
      }
      const data = await res.json();
      results[p.id] = data.url;
    } catch (e: any) {
      errs.push("#" + p.id + ": " + (e.message || String(e)));
      progress.errors = errs;
    }
    progress.completed = i + 1;
    onProgress?.(progress);
    if (i < prompts.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  progress.status = errs.length === prompts.length ? "error" : "done";
  onProgress?.(progress);
  return results;
}
