'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================================
// 模型注册表（前端用）
// ============================================================
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  local: boolean;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "deepseek-v4pro", name: "DeepSeek 云端", provider: "DeepSeek", description: "云端 · 旗舰模型 · 质量最高", local: false },
  { id: "qwen2.5-7b", name: "Qwen 2.5 7B", provider: "Ollama", description: "本地 · 快速 · 8GB显存", local: true },
  { id: "deepseek-r1:8b", name: "DeepSeek R1 8B", provider: "Ollama", description: "本地 · 推理严密 · 8GB显存", local: true },
];

// ============================================================
// Settings 类型
// ============================================================
export interface AppSettings {
  selectedModelId: string;
  /** 用户自定义 API 密钥，按 provider 存储 */
  customApiKeys: Record<string, string>;
}
const DEFAULT_SETTINGS: AppSettings = {
  selectedModelId: "deepseek-v4pro",
  customApiKeys: {},
};

// ============================================================
// Context
// ============================================================
interface SettingsContextValue {
  settings: AppSettings;
  setModelId: (id: string) => void;
  setApiKey: (provider: string, key: string) => void;
  selectedModel: ModelOption;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("visionloop-settings");
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("visionloop-settings", JSON.stringify(s)); } catch (_) {}
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const setModelId = useCallback((id: string) => {
    setSettings((prev) => {
      const next = { ...prev, selectedModelId: id };
      saveSettings(next);
      return next;
    });
  }, []);

  const setApiKey = useCallback((provider: string, key: string) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        customApiKeys: { ...prev.customApiKeys, [provider]: key },
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const selectedModel = MODEL_OPTIONS.find((m) => m.id === settings.selectedModelId) || MODEL_OPTIONS[0];

  return (
    <SettingsContext.Provider value={{ settings, setModelId, setApiKey, selectedModel }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
