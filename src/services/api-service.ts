// AIYOU-style service layer: API 封装
// 所有网络请求集中管理，方便切换后端、添加缓存、重试逻辑

import type { ProductionConstraints } from '@/types';

const BASE = '';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || '服务器错误: ' + res.status);
  }
  return res.json();
}

// ============================================================
// Project API
// ============================================================
export const projectApi = {
  list:   ()                    => request('/api/projects'),
  get:    (id: string)          => request('/api/projects/' + id),
  create: (data: any)           => request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request('/api/projects/' + id, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string)          => request('/api/projects/' + id, { method: 'DELETE' }),
};

// ============================================================
// AI Pipeline API
// ============================================================
export interface AiRequestParams {
  action: string;
  data: Record<string, unknown>;
  modelId: string;
  constraints?: any;
  searchEnabled?: boolean;
}

export const aiApi = {
  call: (params: AiRequestParams) =>
    request('/api/ai', { method: 'POST', body: JSON.stringify(params) }),
  
  analyzeTheme:  (inputText: string, projectType: string, modelId: string) =>
    aiApi.call({ action: 'analyze_theme', data: { inputText, projectType }, modelId, searchEnabled: true }),
  
  generateStory: (idea: any, inputText: string, projectType: string, modelId: string, constraints: any) =>
    aiApi.call({ action: 'generate_story', data: { idea, inputText, projectType }, modelId, constraints, searchEnabled: true }),
  
  generateScript: (story: any, inputText: string, projectType: string, modelId: string, constraints: any) =>
    aiApi.call({ action: 'generate_script', data: { story, inputText, projectType }, modelId, constraints, searchEnabled: true }),
  
  generateShots: (scenes: any[], inputText: string, projectType: string, modelId: string, constraints: any) =>
    aiApi.call({ action: 'generate_shots', data: { scenes, inputText, projectType }, modelId, constraints, searchEnabled: true }),
};

// ============================================================
// Image API
// ============================================================
export const imageApi = {
  generate: (prompt: string) =>
    request('/api/image', { method: 'POST', body: JSON.stringify({ prompt }) }),
};
