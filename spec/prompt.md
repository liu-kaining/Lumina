# 🚀 喂给 Cursor 的分步 Master Prompt (直接复制以下内容)

**注意：千万不要让 Cursor 一次性写完所有代码！** 它会因为上下文太长而崩溃。你要采用**“渐进式 Prompt (Progressive Prompting)”**。

### 📌 步骤一：环境与架构搭建 (发给 Cursor)

> "你是一个顶尖的 Chrome 扩展 (Manifest V3) 与 React 专家。我们现在要开发一款名为 `Lumina` 的高级视觉辅助插件。
> **阶段一任务：搭建项目骨架与通信通道**
> 1. 请帮我确认 WXT (`wxt.dev`) 的初始化结构。
> 2. 在 `wxt.config.ts` 中配置 Manifest V3，包含权限：`sidePanel`, `storage`, `activeTab`, `contextMenus`。
> 3. 创建 `entrypoints/content.ts`：实现监听页面划选事件（mouseup）。获取选中文本和网页 `document.title`。
> 4. 创建 `entrypoints/background.ts`：监听 content script 发来的选中消息，并控制打开 SidePanel (`chrome.sidePanel.open`)。
> 5. 创建 `entrypoints/sidepanel/App.tsx`：建立基础的 React 界面，能实时接收并显示刚选中的文本。
> 
> 
> 请使用 TypeScript，暂时不需要写任何 AI 调用的逻辑和复杂 UI，只需确保“划选文字 -> 打开侧边栏 -> 显示文字”这个通信链路完美跑通。"

*(等待 Cursor 完成并测试通过后，再发第二步)*

### 📌 步骤二：状态管理与本地数据库 (发给 Cursor)

> "干得漂亮。现在进入**阶段二：数据持久化与状态管理**。
> 1. 安装 `zustand` 和 `dexie`。
> 2. 创建 `src/store/useAppStore.ts`，定义 `apiKey` (存入 chrome.storage.local) 和 `selectedText` 的状态。
> 3. 创建 `src/lib/db.ts`。定义一个 Dexie 数据库实例，表名为 `images`，Schema 需要包含：`id (++id)`, `originalText`, `refinedPrompt`, `imageBlob` (注意这里存 Blob 类型而不是 string), `createdAt`。
> 4. 在 SidePanel 写一个简单的设置组件，允许用户输入和保存 API Key。
> 
> 
> 同样，确保类型严格（TypeScript Interface），并保持代码模块化。"

*(等待 Cursor 完成后，再发第三步)*

### 📌 步骤三：AI 核心管道与玻璃拟态 UI (发给 Cursor)

> "现在进入核心**阶段三：AI 流水线与高审美 UI**。
> 1. 安装 `@google/generative-ai`, `framer-motion`, `lucide-react`, 并配置 `tailwindcss`。
> 2. 在 `src/lib/ai-service.ts` 中实现双重调用逻辑（需传入 apiKey）：
> * 方法 A：调用 Gemini 模型（gemini-3-flash），传入选中文字，返回扩充后的英文绘图 Prompt。
> * 方法 B：调用生图模型（使用 Nano Banana 2 或兼容的图片生成逻辑），将方法 A 的输出转化为图片 Blob。
> 
> 
> 3. 在 SidePanel 中实现主 UI。要求极简、**玻璃拟态 (Glassmorphism)** 设计风格。使用 `backdrop-blur` 和半透明边框。
> 4. 当用户点击“生成”时，展示 Framer Motion 的流光 Loading 骨架屏。生成完毕后，将图片存入 Dexie，并使用 `URL.createObjectURL(blob)` 渲染在界面上。支持直接把图片拖拽 (drag-and-drop) 出界面。
> 
> 
> 请确保 UI 代码具有高度的审美，像 Apple 官网或 Linear 一样克制且优雅。"

### 📌 步骤四：批量打包与收尾 (发给 Cursor)

> "最后，**阶段四：打包导出功能**。
> 1. 安装 `jszip` 和 `file-saver`。
> 2. 在 SidePanel 底部增加一个 'Lumina Archive (打包下载)' 按钮。
> 3. 点击后，查询 Dexie 数据库中当前所有的图片 Blob，用 JSZip 将它们打包成一个 `.zip` 文件。
> 4. 文件名按照 `[序号]_[原文前5个字].png` 命名。触发浏览器下载。
> 
> 
> 请处理好相关的错误边界（Error Boundaries）和空状态（Empty States）UI。"