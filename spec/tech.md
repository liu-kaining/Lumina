# 💻 Lumina 工程级开发文档 (Engineering Spec v2.0)

## 一、 核心技术栈与依赖 (Tech Stack & Dependencies)

让 Cursor 在 `package.json` 中准备好这些：

* **框架**: `wxt` (极其重要，处理构建和 MV3 清单)
* **视图**: `react`, `react-dom`
* **路由/状态**: `zustand` (轻量级全局状态)
* **UI/样式**: `tailwindcss`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge` (兼容 shadcn/ui)
* **存储**: `dexie` (IndexedDB 封装), `dexie-react-hooks`
* **打包**: `jszip`, `file-saver`
* **API**: `@google/generative-ai`

## 二、 系统架构与文件目录 (Directory Structure)

Cursor 需要严格按照这个目录结构生成代码（WXT 标准）：

```text
lumina/
├── entrypoints/
│   ├── background.ts       # Service Worker: 负责生命周期、监听快捷键、右键菜单
│   ├── content.ts          # Content Script: 监听划选事件 (mouseup), 提取 DOM 上下文
│   ├── sidepanel/          # 侧边栏独立 React 应用
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx         # 侧边栏主界面
│   └── popup/              # (可选) 极其轻量的弹窗，提示用户去开侧边栏
├── src/
│   ├── components/         # 原子化组件 (Button, Card, Skeleton, MasonryGallery)
│   ├── hooks/              # 自定义 Hooks (useAI, useSelection)
│   ├── lib/
│   │   ├── db.ts           # Dexie 数据库实例与 Schema 定义
│   │   ├── ai-service.ts   # 封装 Gemini 3 Flash 和 Nano Banana 2 的调用逻辑
│   │   └── utils.ts        # tailwind-merge 等通用工具
│   ├── store/
│   │   └── useAppStore.ts  # Zustand 状态 (API Key, 当前选中文字, 生成状态)
│   └── types/
│       └── index.ts        # 全局 TypeScript 接口 (极度重要)
├── wxt.config.ts           # WXT 配置文件 (注册权限、Host)
└── package.json

```

## 三、 核心数据结构 (TypeScript Interfaces)

这是 Cursor 理解业务逻辑的“钥匙”，必须写死：

```typescript
// src/types/index.ts

// 1. 本地数据库模型 (Dexie)
export interface ImageRecord {
  id?: string;             // UUID
  originalText: string;    // 用户划选的原文
  contextTitle: string;    // 网页的标题 (作为背景)
  refinedPrompt: string;   // LLM 增强后的 Prompt
  stylePreset: string;     // 所选风格 (e.g., 'cyberpunk', 'minimalist')
  imageBlob: Blob;         // 核心：图片以 Blob 格式存本地，绝不用 Base64 撑爆内存
  createdAt: number;       // 时间戳
}

// 2. Zustand 状态树
export interface AppState {
  apiKey: string;
  selectedText: string;
  pageContext: string;
  isGenerating: boolean;
  setApiKey: (key: string) => void;
  setSelectedText: (text: string, context: string) => void;
  setGenerating: (status: boolean) => void;
}

// 3. 插件内部通信协议 (Message Passing)
export type MessageAction = 
  | { type: 'TEXT_SELECTED'; payload: { text: string; title: string } }
  | { type: 'OPEN_SIDEPANEL' };

```

## 四、 核心工作流与 API 通信设计 (Workflow & IPC)

### 1. 划选通信流 (Content Script -> Sidepanel)

* `content.ts` 监听 `document.addEventListener('mouseup')`。
* 获取 `window.getSelection().toString()`，如果长度 > 2，则通过 `browser.runtime.sendMessage` 发送 `TEXT_SELECTED`。
* `sidepanel/App.tsx` 内部使用 `useEffect` 监听该消息，更新 Zustand 的 `selectedText`。

### 2. 双重 AI 管道流水线 (The AI Pipeline in `ai-service.ts`)

Cursor 需要按顺序执行这两个 Promise：

* **Phase 1: Prompt 增强 (Gemini 3 Flash)**
* *输入*: `selectedText`, `pageTitle`, `style`
* *输出*: 仅返回一段纯英文的高质量 Image Prompt。


* **Phase 2: 图片生成 (Nano Banana 2 / Gemini 3 Flash Image)**
* *调用*: 将 Phase 1 的输出作为 Prompt，调用生成图像接口。
* *处理*: 拿到结果后，**立即**转换为 `Blob` 对象。


* **Phase 3: 存入数据库**
* 调用 `db.images.add({...})` 将记录写入 Dexie。
