/**
 * LucidMark 全局类型定义
 */

// ==================== 消息通信协议 ====================

/**
 * 插件内部通信消息类型
 */
export type MessageAction =
  | { type: 'TEXT_SELECTED'; payload: { text: string; html: string; title: string; context: string } }
  | { type: 'OPEN_SIDEPANEL' };

/**
 * 消息响应
 */
export interface MessageResponse {
  success: boolean;
  error?: string;
}

// ==================== 数据库模型 ====================

/**
 * 图片记录 - 存储在 IndexedDB 中
 */
export interface ImageRecord {
  id?: number; // Auto-increment
  originalText: string; // 用户划选的原文
  contextTitle: string; // 网页标题
  contextSnippet: string; // 前后文片段
  refinedPrompt: string; // LLM 增强后的 Prompt
  stylePreset: string; // 风格预设
  providerId: string; // 使用的 Provider ID
  imageBlob: Blob; // 图片以 Blob 格式存储
  createdAt: number; // 时间戳
}

// ==================== AI Provider 接口 ====================

/**
 * AI Provider 凭证配置
 */
export interface GeminiCredentials {
  apiKey: string;
}

/**
 * 单个模型配置（用于 Custom OpenAI）
 */
export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
}

/**
 * Custom OpenAI 凭证配置
 * 提示词优化模型和生图模型可独立配置
 */
export interface CustomOpenAICredentials {
  textModel: ModelConfig;   // 提示词优化模型配置
  imageModel: ModelConfig;  // 生图模型配置
}

export type ProviderCredentials = GeminiCredentials | CustomOpenAICredentials;

/**
 * AI Provider 配置
 */
export interface ProviderConfig {
  id: string;
  name: string;
  type: 'gemini' | 'custom';
  credentials?: ProviderCredentials;
}

/**
 * AI Provider 接口 - 适配器模式
 */
export interface AIProvider {
  id: string;
  name: string;
  type: 'gemini' | 'custom';

  /**
   * 增强 Prompt - 将文本转化为专业绘画指令
   */
  enhancePrompt(
    text: string,
    context: string,
    style: string,
    credentials: ProviderCredentials
  ): Promise<string>;

  /**
   * 生成图片
   */
  generateImage(
    prompt: string,
    credentials: ProviderCredentials
  ): Promise<Blob>;
}

// ==================== 风格预设 ====================

/**
 * 风格预设配置
 */
export interface StylePreset {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  promptSuffix: string; // 添加到 Prompt 后缀的提示词
  description: string;
}

// ==================== 图片语言选项 ====================

/**
 * 图片语言选项
 */
export type ImageLanguage = 'chinese' | 'english';

// ==================== 应用状态 ====================

/**
 * 应用状态 - Zustand Store
 */
export interface AppState {
  // Provider 配置
  activeProviderId: string;
  providers: ProviderConfig[];

  // 当前选中的文本
  selectedText: string;
  selectedHtml: string; // 富文本格式
  pageContext: string;
  pageTitle: string;

  // 生成状态
  isGenerating: boolean;
  currentStyle: string;
  imageLanguage: ImageLanguage; // 图片语言选项

  // Actions
  setActiveProvider: (id: string) => void;
  setProviderCredentials: (id: string, credentials: ProviderCredentials) => void;
  setSelectedText: (text: string, html: string, context: string, title: string) => void;
  setGenerating: (status: boolean) => void;
  setCurrentStyle: (style: string) => void;
  setImageLanguage: (language: ImageLanguage) => void;
}