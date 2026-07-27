import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
// ============================================================
// Model Registry
// ============================================================
export const MODEL_REGISTRY: Record<string, { id: string; name: string; provider: string; baseURL: string; model: string; apiKeyEnv: string; description: string; local: boolean }> = {
  "qwen2.5-7b":  { id: "qwen2.5-7b",  name: "Qwen 2.5 7B",  provider: "ollama", baseURL: "http://localhost:11434/v1", model: "qwen2.5:7b",  apiKeyEnv: "OLLAMA_API_KEY", description: "本地 · 轻量快速 · 8GB可跑", local: true },
  "deepseek-r1:8b": { id: "deepseek-r1:8b", name: "DeepSeek R1 8B", provider: "ollama", baseURL: "http://localhost:11434/v1", model: "deepseek-r1:8b", apiKeyEnv: "OLLAMA_API_KEY", description: "本地 · 推理严密 · 8GB可跑", local: true },
  "deepseek-v4pro": { id: "deepseek-v4pro", name: "DeepSeek 云端", provider: "deepseek", baseURL: "https://api.deepseek.com/v1", model: "deepseek-chat", apiKeyEnv: "DEEPSEEK_API_KEY", description: "云端 · 旗舰 · 已配置Key", local: false },
};
export function getModelConfig(modelId: string) {
  return MODEL_REGISTRY[modelId] || MODEL_REGISTRY["qwen2.5-7b"];
}
// ============================================================
// Structured Generation — Ollama 直连 / AI SDK（自动选择）
// ============================================================
export interface StructuredGenParams {
  customApiKeys?: Record<string, string>;
  modelId: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}
export async function generateStructured(params: StructuredGenParams): Promise<Record<string, any>> {
  const config = getModelConfig(params.modelId);
  if (config.local) {
    return ollamaJsonMode(config.model, params);
  } else {
    return cloudStructured(config, params);
  }
}
// ============================================================
// Raw Text Generation — 口播等不需要结构化输出的场景
// ============================================================
export async function generateRawText(params: StructuredGenParams): Promise<string> {
  const config = getModelConfig(params.modelId);
  if (config.local) {
    return ollamaRawText(config.model, params);
  } else {
    return cloudRawText(config, params);
  }
}
// ============================================================
// Internal: Ollama json_object mode
// ============================================================
async function ollamaJsonMode(modelName: string, params: StructuredGenParams): Promise<Record<string, any>> {
  const res = await fetch("http://localhost:11434/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
      temperature: params.temperature ?? 0.5,
      max_tokens: params.maxTokens ?? 4096,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error("Ollama API error: " + res.status);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return extractJson(text);
}
// ============================================================
// Internal: Ollama raw text mode (for koubo etc.)
// ============================================================
async function ollamaRawText(modelName: string, params: StructuredGenParams): Promise<string> {
  const fullPrompt = params.systemPrompt + "\n\n" + params.userPrompt;
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      prompt: fullPrompt,
      stream: false,
      options: { num_predict: 8192, temperature: params.temperature ?? 0.7 },
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error("Ollama error: " + res.status);
  const data = await res.json();
  let text = data.response || "";
  // 去掉 deepseek-r1 的 <｜end▁of▁thinking｜> 标记
  const thinkEnd = text.lastIndexOf(" response");
  return thinkEnd > 0 ? text.substring(thinkEnd + 10).trim() : text.trim();
}
// ============================================================
// Internal: Cloud model via AI SDK
// ============================================================
async function cloudStructured(config: ReturnType<typeof getModelConfig>, params: StructuredGenParams) {
  const apiKey = params.customApiKeys?.[config.provider] || process.env[config.apiKeyEnv];
  if (!apiKey) throw new Error("未配置" + config.name + " 的 API Key");
  const url = config.baseURL.replace(/\/+$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: params.systemPrompt + "\n\n只输出JSON对象。不要markdown代码块。" },
        { role: "user", content: params.userPrompt },
      ],
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 4096,
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error(config.name + " error: " + res.status + " " + (await res.text()).substring(0, 200));
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return extractJson(text);
}
async function cloudRawText(config: ReturnType<typeof getModelConfig>, params: StructuredGenParams) {
  const apiKey = params.customApiKeys?.[config.provider] || process.env[config.apiKeyEnv];
  if (!apiKey) throw new Error("未配置" + config.name + " 的 API Key");
  const url = config.baseURL + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
      temperature: params.temperature ?? 0.7,
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error(config.name + " error: " + res.status + " " + (await res.text()).substring(0, 200));
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
// ============================================================
// JSON extraction helper
// ============================================================
function extractJson(text: string): Record<string, any> {
  let cleaned = text.replace(/```(?:json)?/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(cleaned.substring(start, end + 1));
    } catch (e) {
      throw new Error("JSON parse failed: " + String(e).substring(0, 100));
    }
  }
  throw new Error("No JSON found in response: " + text.substring(0, 200));
}
