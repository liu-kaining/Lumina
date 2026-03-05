# 💎 第一部分：Lumina 产品需求文档 (PRD) v2.0 终极版

## 1. 产品概述

* **产品名称**：Lumina (光影档案)
* **产品形态**：基于 Manifest V3 的 Chrome 浏览器扩展
* **核心定位**：专为创作者打造的“划选即绘图”本地视觉助手。支持多模型无缝切换，提供顶级审美的交互体验与本地资产管理。

## 2. 核心交互流 (User Flow)

1. **沉浸触发**：用户在任何网页（Notion/语雀等）划选文本，使用快捷键或右键菜单唤起 Lumina 右侧边栏 (SidePanel)。
2. **上下文捕获**：插件静默提取：`选中文本` + `网页标题` + `前后文语境`。
3. **多模态增强**：Lumina Prism 引擎调用大语言模型（如 Gemini 3 Flash），将上下文翻译并扩充为专业级英文绘画 Prompt。
4. **视觉具象**：调用绘图模型（如 Nano Banana 2 或 Flux），在侧边栏渲染生成动画，最终展示图片。
5. **消费与管理**：图片存入本地数据库。用户可直接拖拽图片到编辑器，或一键打包导出 ZIP。

## 3. 功能模块详细说明

### 3.1 触发与通信模块

* **划选悬浮标**：选中文本（>2字符）时，光标上方出现轻量 Logo，点击打开侧边栏。
* **快捷键/右键**：支持 `Cmd/Ctrl+Shift+L` 或右键菜单直接触发生成。

### 3.2 智能侧边栏 (Lumina Workspace)

* **顶部控制台**：
* **Provider 切换器**：快速切换当前使用的 AI 引擎（如 Gemini / Custom OpenAI）。
* **风格预设**：下拉选择绘画风格（如 Cinematic, 3D Render, Minimalist）。


* **创作画板**：
* **输入展示**：展示当前捕获的原文和上下文摘要。
* **Prompt 棱镜**：支持展开查看和手动微调 AI 扩充后的英文 Prompt。
* **生成视窗**：使用骨架屏和微光动效 (Shimmer) 作为 Loading 状态。生成后支持拖拽 (Drag & Drop)。


* **历史画廊与导出**：
* 瀑布流展示当前历史图片。
* 提供“Lumina Archive (打包导出)”按钮，自动压缩为 `.zip` 下载。



### 3.3 模型配置台 (Settings & Adapter UI)

* 在配置页支持多模型管理：
* **Gemini**：只需填入 API Key。
* **Custom (兼容 OpenAI)**：需填入 `Base URL`, `API Key`, `Text Model`, `Image Model`。


* 数据安全：所有 Key 必须存在 `chrome.storage.local`，仅在本地发起请求。

---

# 🛠️ 第二部分：Lumina 技术架构文档 (Tech Spec)

## 1. 核心技术栈

* **扩展框架**: `wxt` (Vite 驱动，极速构建 MV3)
* **前端视图**: React 18 + Tailwind CSS + shadcn/ui + Framer Motion
* **全局状态**: Zustand
* **本地存储**: Dexie.js (存储大体积 Blob 图片), `chrome.storage` (存储配置)
* **文件处理**: JSZip, FileSaver.js

## 2. 目录结构规范

```text
lumina/
├── entrypoints/
│   ├── background.ts       # 监听右键/快捷键，管理 SidePanel 状态
│   ├── content.ts          # 监听 mouseup，抓取 DOM 选区和标题
│   └── sidepanel/          # 核心 React 应用
│       ├── App.tsx
│       └── main.tsx
├── src/
│   ├── core/               # 核心业务逻辑
│   │   ├── ai/             # ★ Provider-Adapter 架构引擎
│   │   │   ├── AIProviderFactory.ts
│   │   │   ├── interfaces.ts    # 定义 AIProvider 接口
│   │   │   └── adapters/        # GeminiAdapter, CustomAdapter 等
│   │   ├── db.ts           # Dexie 数据库定义
│   │   └── store.ts        # Zustand 状态树
│   ├── components/         # UI 组件 (ui/, layout/, business/)
│   └── utils/              # 辅助函数 (zip 导出等)
└── wxt.config.ts           # 权限与打包配置

```

## 3. 核心接口契约 (TypeScript Interfaces)

**本地数据库 (Dexie):**

```typescript
interface ImageRecord {
  id?: string;
  originalText: string;
  refinedPrompt: string;
  stylePreset: string;
  imageBlob: Blob;       // 必须存 Blob，防内存泄漏
  createdAt: number;
}

```

**多模型适配器引擎 (Adapter Pattern):**

```typescript
export interface AIProvider {
  id: string;
  name: string;
  // 第一段：文本扩充
  enhancePrompt(text: string, context: string, style: string, credentials: any): Promise<string>;
  // 第二段：生成图片
  generateImage(prompt: string, credentials: any): Promise<Blob>;
}

```

---

# 🚀 第三部分：发给 Cursor 的渐进式开发指令 (Master Prompts)

**⚠️ 极其重要提示：** 请**不要**把下面四步一次性全部发给 Cursor！你需要一步一步来，每完成一步，检查代码没有报错，再发下一步。这样能保证它写出最完美的架构。

### 📌 步骤一：初始化与底层通信 (复制发给 Cursor)

> "你是一个顶尖的 Chrome 扩展 (Manifest V3) 与 React 架构师。我们现在要开发一款名为 `Lumina` 的高级视觉辅助插件。
> **阶段一：搭建项目骨架与 IPC 通信**
> 1. 请基于 WXT (`wxt.dev`) 框架初始化目录。
> 2. 在 `wxt.config.ts` 中配置 Manifest V3，包含权限：`sidePanel`, `storage`, `activeTab`, `contextMenus`。
> 3. 创建 `entrypoints/content.ts`：实现监听页面划选事件（mouseup）。获取选中文本和 `document.title`。如果有选中文字，向 background 发送消息。
> 4. 创建 `entrypoints/background.ts`：接收 content 消息，使用 `chrome.sidePanel.open` 打开侧边栏，并将数据转发给 SidePanel。
> 5. 创建 `entrypoints/sidepanel/App.tsx`：建立基础的 React 界面，能实时接收并显示刚选中的文本。
> 
> 
> 请使用 TypeScript 强类型，暂时不需要写复杂的 UI，确保“网页划选 -> 打开侧边栏 -> 显示文字”的通信链路完美跑通。"

### 📌 步骤二：状态管理与持久化 (检查第一步完成后，发送此段)

> "**阶段二：数据持久化与状态管理**
> 1. 安装依赖：`zustand`, `dexie`, `dexie-react-hooks`。
> 2. 创建 `src/core/store.ts` (Zustand)：定义应用状态，包含 `activeProviderId` ('gemini' | 'custom')，`apiKeys` (对象结构)，以及当前 `selectedText`。配置信息需通过订阅同步到 `chrome.storage.local`。
> 3. 创建 `src/core/db.ts` (Dexie)：定义数据库实例 `luminaDB`。建立一张 `images` 表，字段包括：`++id, originalText, refinedPrompt, stylePreset, imageBlob (注意是 Blob 类型), createdAt`。
> 4. 在 SidePanel 中编写一个“设置面板”组件，允许用户选择 Provider 并输入对应的 API Key，输入后存入全局状态。代码需保持高度模块化。"
> 
> 

### 📌 步骤三：Provider-Adapter 架构 (架构核心，发送此段)

> "**阶段三：多模型适配器引擎 (AI Engine)**
> 我们需要极强的扩展性，绝不能把模型写死。请严格遵循 Adapter 模式：
> 1. 在 `src/core/ai/interfaces.ts` 中，定义 `AIProvider` 接口，包含 `enhancePrompt(text, context, style, creds): Promise<string>` 和 `generateImage(prompt, creds): Promise<Blob>` 两个方法。
> 2. 在 `src/core/ai/adapters/` 下创建两个类：
> * `GeminiAdapter.ts`: 实现接口。调用 Google Generative AI SDK (Flash 扩充词汇, Nano Banana 2生图)。
> * `CustomAdapter.ts`: 实现接口。使用纯 Fetch 发起兼容 OpenAI 格式的请求。
> 
> 
> 3. 创建 `src/core/ai/AIProviderFactory.ts`，提供一个静态方法根据传入的 providerId 返回对应的 Adapter 实例。
> 4. 在 SidePanel 业务代码中，基于工厂获取实例并串行执行 `enhancePrompt` 和 `generateImage`，最终将生成的 Blob 写入 Dexie 数据库。业务 UI 组件中坚决不允许出现直接 fetch API 的代码。"
> 
> 

### 📌 步骤四：高定 UI 与导出流 (美化阶段，发送此段)

> "**阶段四：极致审美 UI 与 Zip 导出功能**
> 1. 安装依赖：`tailwindcss`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, `jszip`, `file-saver`。
> 2. **UI 重构要求**：Lumina 必须具备极高审美。请使用 **Glassmorphism (玻璃拟态)** 风格。背景使用 `backdrop-blur-xl`，配以深色/浅色的半透明底色。
> 3. **动效要求**：图片生成时的 Loading 状态，请使用 Framer Motion 实现优雅的“微光扫过 (Shimmer)”骨架屏。图片加载成功后要有顺滑的 `Fade-in`。图片组件需要支持 Drag-and-Drop 拖出。
> 4. **画廊与导出**：在 SidePanel 底部展示 Dexie 数据库中的图片瀑布流。添加一个 `Lumina Archive` 按钮，点击后查询当前全部图片 Blob，使用 JSZip 打包并触发下载，压缩包内的命名规则为 `[时间戳]_[原文截取].png`。"
> 
> 
