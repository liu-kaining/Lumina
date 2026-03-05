import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from '../interfaces';
import { GeminiCredentials, ProviderCredentials, ImageLanguage } from '../../../types';
import { applyStyleToPrompt } from '../../presets';

/**
 * Google Gemini Provider 适配器
 * 使用 Gemini 3.1 Pro 进行 Prompt 增强
 * 使用 Nano Banana Pro (gemini-3-pro-image-preview) 进行图片生成
 */
export class GeminiAdapter implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';
  type = 'gemini' as const;

  /**
   * 增强 Prompt
   * 根据 imageLanguage 决定输出中文还是英文的绘图指令
   */
  async enhancePrompt(
    text: string,
    context: string,
    style: string,
    credentials: ProviderCredentials,
    imageLanguage: ImageLanguage = 'chinese'
  ): Promise<string> {
    const geminiCreds = credentials as GeminiCredentials;

    if (!geminiCreds.apiKey) {
      throw new Error('Gemini API Key 未配置');
    }

    console.log('[Gemini] Starting prompt enhancement...');
    console.log('[Gemini] Model: gemini-3.1-pro-preview');
    console.log('[Gemini] Image language:', imageLanguage);
    
    const genAI = new GoogleGenerativeAI(geminiCreds.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

    // 根据语言选择不同的提示词
    const languageInstruction = imageLanguage === 'chinese'
      ? `IMPORTANT: The generated image MUST display text in CHINESE (中文). When the image contains any text, labels, or words, they must be in Chinese characters. This is critical.`
      : `IMPORTANT: The generated image MUST display text in ENGLISH. When the image contains any text, labels, or words, they must be in English. This is critical.`;

    const systemPrompt = `You are an expert image prompt engineer. Your task is to transform the given text into a high-quality, detailed image generation prompt.

Guidelines:
- Transform the user's selected text into a vivid, detailed visual description
- Consider the context and webpage title when relevant
- Use professional photography and art terminology
- Include details about lighting, composition, mood, and style
- ALWAYS include quality requirements: "4K resolution, ultra high quality, sharp details, professional photography"
- Make the prompt suitable for AI image generation
- Output ONLY the enhanced prompt, nothing else
- Keep the prompt concise but descriptive (50-150 words)
${languageInstruction}`;

    const userPrompt = `Context: ${context || 'No additional context provided'}

Selected text: "${text}"

Please create an enhanced image generation prompt based on the selected text and context. Remember: the image MUST contain ${imageLanguage === 'chinese' ? 'CHINESE (中文)' : 'ENGLISH'} text if there are any words in the image.`;

    try {
      console.log('[Gemini] Sending request to API...');
      const startTime = Date.now();
      
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
      ]);

      const elapsed = Date.now() - startTime;
      console.log(`[Gemini] API response received in ${elapsed}ms`);

      const enhancedPrompt = result.response.text();
      console.log('[Gemini] Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');

      // 应用风格
      const finalPrompt = applyStyleToPrompt(enhancedPrompt, style);

      return finalPrompt;
    } catch (error) {
      console.error('[Gemini] Prompt enhancement failed:', error);
      
      // 更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          throw new Error('Gemini API 配额已用尽，请稍后再试或升级到付费计划');
        }
        if (error.message.includes('401') || error.message.includes('invalid')) {
          throw new Error('Gemini API Key 无效，请检查配置');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('网络连接失败，请检查网络后重试');
        }
        if (error.message.includes('404') || error.message.includes('not found')) {
          throw new Error('模型不可用，请尝试使用其他模型');
        }
        throw new Error(`Prompt 增强失败: ${error.message}`);
      }
      
      throw new Error('Prompt 增强失败: 未知错误');
    }
  }

  /**
   * 生成图片
   * 根据 imageLanguage 提示模型使用对应语言
   */
  async generateImage(
    prompt: string,
    credentials: ProviderCredentials,
    imageLanguage: ImageLanguage = 'chinese'
  ): Promise<Blob> {
    const geminiCreds = credentials as GeminiCredentials;

    if (!geminiCreds.apiKey) {
      throw new Error('Gemini API Key 未配置');
    }

    console.log('[Gemini] Starting image generation...');
    console.log('[Gemini] Model: gemini-3-pro-image-preview');
    console.log('[Gemini] Image language:', imageLanguage);

    const genAI = new GoogleGenerativeAI(geminiCreds.apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    } as any);

    // 添加语言提示
    const languageHint = imageLanguage === 'chinese'
      ? 'IMPORTANT: Any text in the image must be in Chinese (中文).'
      : 'IMPORTANT: Any text in the image must be in English.';

    try {
      console.log('[Gemini] Sending image generation request...');
      const startTime = Date.now();
      
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${languageHint}\n\nGenerate a high-quality image in 4K resolution with ultra sharp details and professional quality based on this description: ${prompt}` }],
          },
        ],
        generationConfig: {
          responseModalities: ['image', 'text'],
        },
      } as any);

      const elapsed = Date.now() - startTime;
      console.log(`[Gemini] Image generated in ${elapsed}ms`);

      // 提取图片数据
      const response = result.response;

      // 检查响应中是否包含图片
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            // 将 base64 转换为 Blob
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;

            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            console.log(`[Gemini] Image blob created, size: ${blob.size} bytes`);
            return blob;
          }
        }
      }

      throw new Error('响应中未找到图片数据');
    } catch (error) {
      console.error('[Gemini] Image generation failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          throw new Error('Gemini API 配额已用尽，请稍后再试或升级到付费计划');
        }
        if (error.message.includes('401') || error.message.includes('invalid')) {
          throw new Error('Gemini API Key 无效，请检查配置');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('网络连接失败，请检查网络后重试');
        }
        throw new Error(`图片生成失败: ${error.message}`);
      }
      
      throw new Error('图片生成失败: 未知错误');
    }
  }
}