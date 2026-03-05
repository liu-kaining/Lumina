import { AIProviderFactory } from './ai/AIProviderFactory';
import { ProviderCredentials, ImageLanguage } from '../types';
import { dbOperations } from './db';

/**
 * 带超时的 Promise 包装
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${errorMessage}（超时 ${timeoutMs / 1000} 秒）`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * AI 服务封装
 * 提供简洁的 API 供 UI 层调用
 */
export class AIService {
  // 超时配置
  private static ENHANCE_TIMEOUT = 90000; // Prompt 增强超时 90 秒
  private static GENERATE_TIMEOUT = 300000; // 图片生成超时 300 秒（5 分钟）

  /**
   * 完整的图片生成流程
   * 1. 增强 Prompt
   * 2. 生成图片
   * 3. 存储到数据库
   */
  static async generateAndSaveImage(params: {
    providerId: string;
    credentials: ProviderCredentials;
    selectedText: string;
    context: string;
    pageTitle: string;
    style: string;
    imageLanguage?: ImageLanguage;
    onProgress?: (step: 'enhancing' | 'generating', message: string) => void;
  }): Promise<number> {
    const {
      providerId,
      credentials,
      selectedText,
      context,
      pageTitle,
      style,
      imageLanguage = 'chinese',
      onProgress,
    } = params;

    // 获取 Provider 实例
    const provider = AIProviderFactory.getProvider(providerId);

    // Step 1: 增强 Prompt
    onProgress?.('enhancing', '正在连接 Gemini API...');
    
    try {
      const refinedPrompt = await withTimeout(
        provider.enhancePrompt(selectedText, context, style, credentials, imageLanguage),
        this.ENHANCE_TIMEOUT,
        'Prompt 增强超时，请检查网络连接'
      );

      console.log('Enhanced Prompt:', refinedPrompt);
      onProgress?.('enhancing', '分析完成，准备生成图片...');

      // Step 2: 生成图片
      onProgress?.('generating', '正在调用图片生成模型...');
      
      const imageBlob = await withTimeout(
        provider.generateImage(refinedPrompt, credentials, imageLanguage),
        this.GENERATE_TIMEOUT,
        '图片生成超时，请稍后重试'
      );

      onProgress?.('generating', '图片生成完成，正在保存...');

      // Step 3: 存储到数据库
      const imageId = await dbOperations.addImage({
        originalText: selectedText,
        contextTitle: pageTitle,
        contextSnippet: context,
        refinedPrompt,
        stylePreset: style,
        providerId,
        imageBlob,
        createdAt: Date.now(),
      });

      return imageId;
    } catch (error) {
      console.error('Generation failed:', error);
      throw error;
    }
  }

  /**
   * 仅增强 Prompt（不生成图片）
   */
  static async enhancePromptOnly(params: {
    providerId: string;
    credentials: ProviderCredentials;
    selectedText: string;
    context: string;
    style: string;
    imageLanguage?: ImageLanguage;
  }): Promise<string> {
    const { providerId, credentials, selectedText, context, style, imageLanguage = 'chinese' } = params;

    const provider = AIProviderFactory.getProvider(providerId);
    return await withTimeout(
      provider.enhancePrompt(selectedText, context, style, credentials, imageLanguage),
      this.ENHANCE_TIMEOUT,
      'Prompt 增强超时'
    );
  }

  /**
   * 使用已有 Prompt 直接生成图片
   */
  static async generateImageOnly(params: {
    providerId: string;
    credentials: ProviderCredentials;
    prompt: string;
    imageLanguage?: ImageLanguage;
  }): Promise<Blob> {
    const { providerId, credentials, prompt, imageLanguage = 'chinese' } = params;

    const provider = AIProviderFactory.getProvider(providerId);
    return await withTimeout(
      provider.generateImage(prompt, credentials, imageLanguage),
      this.GENERATE_TIMEOUT,
      '图片生成超时'
    );
  }
}