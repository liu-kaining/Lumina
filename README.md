# ✨ LucidMark - 光影档案

一款为创作者打造的"划选即绘图"本地视觉助手。基于 Manifest V3 的 Chrome 扩展，支持多模型无缝切换，提供顶级审美的交互体验与本地资产管理。

![LucidMark Demo](./assets/demo.png)

## 🌟 核心特性

### 🎨 智能配图生成
- **上下文感知**：自动提取选中文本、网页标题、前后语境
- **AI 增强 Prompt**：将文字转化为专业级英文绘画指令
- **多模型支持**：Gemini / Custom OpenAI 自由切换
- **8 种风格预设**：电影感、吉卜力风、赛博朋克等

### 🖱️ 多维触发方式
- **快捷键**：`Cmd/Ctrl + Shift + L` 一键生成
- **右键菜单**：选中文本后右键"发送至 LucidMark"
- **自动捕获**：智能提取上下文信息

### 💎 极致审美体验
- **玻璃拟态 UI**：现代感的毛玻璃界面设计
- **微光动效**：优雅的 Shimmer Loading 动画
- **Framer Motion**：流畅的交互动效
- **响应式布局**：瀑布流画廊展示

### 🔐 本地优先
- **零遥测**：无任何用户行为追踪
- **本地存储**：API Key 仅存储在 chrome.storage.local
- **IndexedDB**：图片以 Blob 格式本地存储，避免内存泄漏
- **一键导出**：ZIP 打包所有生成图片

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
# Chrome
npm run dev

# Firefox
npm run dev:firefox
```

### 3. 构建生产版本

```bash
# Chrome
npm run build

# Firefox
npm run build:firefox
```

构建产物位于 `.output/chrome-mv3/` 目录。

### 4. 加载扩展

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `.output/chrome-mv3/` 目录

### 5. 配置 API Key

1. 点击浏览器工具栏的 LucidMark 图标
2. 点击右上角设置按钮 ⚙️
3. 选择 Provider 并输入 API Key
   - **Gemini**：只需填入 API Key
   - **Custom OpenAI**：需填入 Base URL、API Key、模型名称

---

## 📖 使用指南

### 方式一：快捷键触发
1. 在任意网页划选文本
2. 按下 `Cmd/Ctrl + Shift + L`
3. SidePanel 自动打开并开始生成

### 方式二：右键菜单
1. 在网页中选中文本
2. 右键点击 → "✨ 发送至 LucidMark 生成配图"
3. 等待生成完成

### 图片管理
- **拖拽使用**：直接拖拽图片到编辑器（如 Notion、语雀）
- **单图下载**：悬停图片点击下载按钮
- **批量导出**：点击"打包下载"导出所有图片为 ZIP

---

## 🏗️ 技术架构

### 核心技术栈

| 类别 | 技术 |
|------|------|
| 扩展框架 | WXT (Vite 驱动 MV3) |
| 前端视图 | React 18 + Tailwind CSS |
| 动效 | Framer Motion |
| 状态管理 | Zustand |
| 本地存储 | Dexie.js (IndexedDB) |
| 文件处理 | JSZip + FileSaver.js |
| AI SDK | @google/generative-ai |

### 项目结构

```
LucidMark/
├── entrypoints/
│   ├── background.ts          # Service Worker
│   ├── content.ts              # Content Script (划选监听)
│   └── sidepanel/              # SidePanel React 应用
│       ├── App.tsx
│       ├── main.tsx
│       └── style.css
├── src/
│   ├── core/
│   │   ├── ai/                 # AI Provider-Adapter 架构
│   │   │   ├── interfaces.ts
│   │   │   ├── AIProviderFactory.ts
│   │   │   └── adapters/
│   │   │       ├── GeminiAdapter.ts
│   │   │       └── CustomAdapter.ts
│   │   ├── ai-service.ts       # AI 服务封装
│   │   ├── db.ts               # Dexie 数据库
│   │   └── presets.ts          # 风格预设配置
│   ├── components/
│   │   ├── settings/           # 设置面板
│   │   ├── ui/                 # UI 组件
│   │   └── GenerationPanel.tsx # 生成流程面板
│   ├── store/                  # Zustand 状态管理
│   ├── types/                  # TypeScript 类型定义
│   └── utils/                  # 工具函数
└── wxt.config.ts               # WXT 配置
```

### AI Provider-Adapter 架构

支持灵活扩展多种 AI 模型：

```typescript
interface AIProvider {
  id: string;
  name: string;
  type: 'gemini' | 'custom';
  
  // Prompt 增强
  enhancePrompt(text, context, style, credentials): Promise<string>;
  
  // 图片生成
  generateImage(prompt, credentials): Promise<Blob>;
}
```

---

## 🎨 风格预设

| 风格 | 描述 | 提示词关键词 |
|------|------|--------------|
| 智能推断 | AI 自动判断风格 | - |
| 电影感 | 电影级画面质感 | cinematic lighting, dramatic atmosphere |
| 等距 3D | 等距视角 3D 插画 | isometric 3D render, minimal geometric |
| 极简矢量 | 扁平化矢量风格 | minimalist flat design, clean lines |
| 吉卜力风 | 宫崎骏动画风格 | Studio Ghibli style, hand-drawn |
| 赛博朋克 | 未来科技感 | cyberpunk, neon lights, futuristic |
| 水彩画 | 柔和水彩艺术 | watercolor painting, soft edges |
| 日系动漫 | 动漫绘画风格 | anime style, vibrant colors |

---

## 🔧 配置说明

### Gemini Provider

```typescript
{
  apiKey: string;  // Google AI Studio API Key
}
```

**使用的模型**：
- Prompt 增强：`gemini-2.0-flash`
- 图片生成：`gemini-2.0-flash-exp-image-generation`

### Custom OpenAI Provider

```typescript
{
  apiKey: string;      // API Key
  baseUrl: string;     // API Base URL (如 https://api.openai.com/v1)
  textModel: string;   // 文本模型 (如 gpt-4)
  imageModel: string;  // 图片模型 (如 dall-e-3)
}
```

---

## 📦 依赖说明

### 生产依赖
- `react` / `react-dom` - UI 框架
- `zustand` - 状态管理
- `dexie` / `dexie-react-hooks` - IndexedDB 封装
- `@google/generative-ai` - Gemini SDK
- `framer-motion` - 动效库
- `lucide-react` - 图标库
- `jszip` / `file-saver` - 文件打包导出
- `clsx` / `tailwind-merge` - 样式工具

### 开发依赖
- `wxt` - 扩展框架
- `typescript` - 类型检查
- `tailwindcss` / `@tailwindcss/postcss` - CSS 框架

---

## 🛡️ 隐私与安全

- ✅ **零遥测**：不收集任何用户数据
- ✅ **本地存储**：所有配置仅存储在本地
- ✅ **API Key 安全**：不显示明文，仅展示 `sk-...xxxx`
- ✅ **网络白名单**：仅允许请求配置的 API 端点

---

## 📝 开发计划

- [ ] 划选悬浮标（Tooltip Logo）
- [ ] 图片预览放大
- [ ] Prompt 手动编辑
- [ ] 更多 AI 模型支持（Midjourney、Stable Diffusion）
- [ ] 图片缓存自动清理
- [ ] 深色/浅色主题切换
- [ ] 多语言支持

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License

---

## 🙏 致谢

- [WXT](https://wxt.dev/) - 优秀的扩展开发框架
- [Google Gemini](https://ai.google.dev/) - 强大的 AI 能力
- [Framer Motion](https://www.framer.com/motion/) - 流畅的动效库
- [shadcn/ui](https://ui.shadcn.com/) - 设计灵感来源

---

<p align="center">
  Made with ❤️ by LucidMark Team
</p>