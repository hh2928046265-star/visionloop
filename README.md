# VisionLoop

> AI 视觉导演工作台 — 让产品创意秒变专业分镜故事板

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## 定位

不是 AI 聊天工具。VisionLoop 是一个**结构化创作流水线**，专为短视频创作者、带货博主、摄影师设计：

`
创意输入 → 主题分析 → 故事结构 → 剧本创作 → 分镜拆解 → 故事板导出
`

## 功能

- **主题分析** 联网搜索 + AI 分析，自动提取产品档案（包装/形态/场景）
- **故事结构** 四段式叙事（开场/发展/高潮/结局）
- **剧本创作** 场景级剧本，可编辑/新增/删除每个场景
- **分镜拆解** 专业镜头语言（景别/焦段/机位/运镜/构图/光线/情绪/声音）
- **故事板** AI 生成图片 + 文字说明，导出 HTML
- **拍摄约束** 出镜方式 / 场景 / 成本三重硬约束，全程生效
- **产品锁定** 强制纠正包装描述错误（瓶装→真空包装）

## 项目类型

| 类型 | 场景数 | 风格 |
|------|--------|------|
| 种草推广 | 4 | 小红书/抖音带货 |
| 口播带货 | 1 | 一镜到底，主播台词 |
| Vlog | 5 | 生活记录叙事 |
| 宣传片 | 7 | 品牌级视觉 |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 16 + React 19 + TypeScript + Tailwind CSS + Framer Motion |
| 后端 | Next.js API Routes |
| 数据库 | SQLite + Drizzle ORM |
| AI | Ollama 本地模型 + DeepSeek 云端 |
| 图片 | Pollinations.ai (免费) + Fooocus (本地可选) |
| 搜索 | 联网搜索增强创作 |

## 快速启动

### 1. 安装依赖

\\ash
npm install
\
### 2. 启动 Ollama（可选，使用本地模型）

\\ash
ollama pull qwen2.5:7b
\
### 3. 配置 DeepSeek API Key（可选，使用云端模型）

在首页点击「配置密钥」，填入你的 DeepSeek API Key。

### 4. 启动开发服务器

\\ash
npm run dev
\
打开 http://localhost:3000

### 5. 初始化数据库

首次启动会自动创建 SQLite 数据库。迁移文件在 drizzle/ 目录。

## 模型选择

| 模型 | 类型 | 显存 | 说明 |
|------|------|------|------|
| Qwen 2.5 7B | 本地 | 8GB | 推荐，速度快 |
| Qwen 2.5 3B | 本地 | 4GB | 极速 |
| DeepSeek R1 8B | 本地 | 8GB | 推理强 |
| DeepSeek V4 Pro | 云端 | - | 质量最高（需 API Key） |

## 项目结构

\src/
├── app/
│   ├── api/
│   │   ├── ai/          # AI 流水线入口
│   │   ├── image/       # 图片生成代理
│   │   ├── projects/    # 项目 CRUD
│   │   └── search/      # 联网搜索代理
│   ├── project/[id]/    # 项目工作台（核心页面）
│   └── projects/        # 项目列表
├── lib/
│   ├── ai/
│   │   ├── pipeline.ts       # 核心流水线（4步）
│   │   ├── provider.ts       # 模型路由
│   │   ├── product-lock.ts   # 产品档案锁定
│   │   ├── post-process.ts   # 输出清洗
│   │   ├── types.ts          # 类型定义
│   │   └── prompts/          # Prompt 模板（6个）
│   ├── db/                   # 数据库
│   ├── search/               # 联网搜索
│   ├── image-service.ts      # 图片服务
│   └── settings-store.tsx     # 全局设置
└── components/
    ├── home/             # 首页组件
    ├── project/          # 项目组件
    └── ...               # 通用 UI 组件
\
## License

MIT
