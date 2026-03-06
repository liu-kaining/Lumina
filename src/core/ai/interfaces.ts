import { ProviderCredentials, ImageLanguage } from '../../types';

/**
 * AI Provider 接口
 * 所有 AI 适配器必须实现这个接口
 */
export interface AIProvider {
  id: string;
  name: string;
  type: 'gemini' | 'custom';

  /**
   * 增强 Prompt - 将文本转化为专业绘画指令
   * @param text 用户选中的文本
   * @param context 上下文片段
   * @param style 风格 ID
   * @param credentials Provider 凭证
   * @param imageLanguage 图片语言选项
   * @returns 增强后的绘图 Prompt
   */
  enhancePrompt(
    text: string,
    context: string,
    style: string,
    credentials: ProviderCredentials,
    imageLanguage?: ImageLanguage,
    signal?: AbortSignal,
    pageTitle?: string
  ): Promise<string>;

  /**
   * 生成图片
   * @param prompt 增强后的 Prompt
   * @param credentials Provider 凭证
   * @param imageLanguage 图片语言选项
   * @param signal 可选，用于取消请求
   * @returns 图片 Blob
   */
  generateImage(
    prompt: string,
    credentials: ProviderCredentials,
    imageLanguage?: ImageLanguage,
    signal?: AbortSignal
  ): Promise<Blob>;
}