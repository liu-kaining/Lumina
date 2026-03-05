import { AIProvider } from './interfaces';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { CustomAdapter } from './adapters/CustomAdapter';

/**
 * AI Provider 工厂
 * 根据 providerId 返回对应的适配器实例
 */
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static {
    // 注册默认 Provider
    this.registerProvider(new GeminiAdapter());
    this.registerProvider(new CustomAdapter());
  }

  /**
   * 注册 Provider
   */
  static registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * 获取 Provider 实例
   */
  static getProvider(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`未找到 Provider: ${providerId}`);
    }

    return provider;
  }

  /**
   * 获取所有已注册的 Provider ID
   */
  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}