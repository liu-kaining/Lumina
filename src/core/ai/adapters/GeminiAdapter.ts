import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from '../interfaces';
import { GeminiCredentials, ProviderCredentials, ImageLanguage } from '../../../types';
import { applyStyleToPrompt, getStylePresetById } from '../../presets';

/**
 * Google Gemini Provider 适配器
 * Prompt 增强：gemini-3.1-pro-preview
 * 图片生成：gemini-3-pro-image-preview (Nano Banana Pro) / gemini-3.1-flash-image-preview (Nano Banana 2)
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
    imageLanguage: ImageLanguage = 'chinese',
    _signal?: AbortSignal,
    pageTitle?: string
  ): Promise<string> {
    const geminiCreds = credentials as GeminiCredentials;

    if (!geminiCreds.apiKey) {
      throw new Error('Gemini API Key 未配置');
    }

    const genAI = new GoogleGenerativeAI(geminiCreds.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

    const languageInstruction = imageLanguage === 'chinese'
      ? `CRITICAL: Any text shown IN the image (titles, labels, captions) MUST be in CHINESE (中文).`
      : `CRITICAL: Any text shown IN the image MUST be in ENGLISH.`;

    const stylePreset = getStylePresetById(style);
    
    const systemPrompt = `You are an expert at writing prompts for AI image generation. Your output will be used directly to generate an image. Do NOT just paraphrase or repeat the user's text.

Your output MUST be a single, detailed IMAGE PROMPT that describes the SCENE to be drawn. Include:
- Subject: what is shown (characters, objects, setting)
- Composition: framing, angle, layout
- Lighting: type of light, mood, shadows
- Style: visual style (e.g. cinematic, illustration, 3D render)
- Quality: 4K, sharp details, professional
${stylePreset && stylePreset.id !== 'default' ? `- You MUST weave in this artistic style: ${stylePreset.nameEn}. ${stylePreset.description}. Key elements: ${stylePreset.promptSuffix}` : ''}

Rules:
- Output ONLY the image prompt. No explanations, no "Here is...", no markdown.
- Length: 60–180 words. Be specific and visual.
- Write in English. ${languageInstruction}`;

    const userPrompt = `Page title: ${pageTitle || '(not provided)'}
Context (snippet): ${context || '—'}

User's selected text (turn this into a full image prompt, do not just copy):
"${text}"${stylePreset && stylePreset.id !== 'default' ? `

Required style: ${stylePreset.nameEn} — integrate it into the scene (lighting, colors, mood).` : ''}

Generate one image prompt that fully describes the scene to draw.`;

    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
      ]);

      const enhancedPrompt = result.response.text();
      
      if (!enhancedPrompt || enhancedPrompt.trim() === '') {
        throw new Error('AI 返回了空提示词');
      }
      
      // 检查是否返回的提示词就是原始文本（可能说明AI没有正确优化）
      const normalizedInput = text.trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedOutput = enhancedPrompt.trim().toLowerCase().replace(/\s+/g, ' ');
      
      if (normalizedOutput === normalizedInput) {
        throw new Error('AI 未能优化提示词，返回了原始文本');
      }

      const finalPrompt = applyStyleToPrompt(enhancedPrompt, style);
      return finalPrompt;
    } catch (error) {
      
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
    imageLanguage: ImageLanguage = 'chinese',
    _signal?: AbortSignal
  ): Promise<Blob> {
    const geminiCreds = credentials as GeminiCredentials;

    if (!geminiCreds.apiKey) {
      throw new Error('Gemini API Key 未配置');
    }

    const genAI = new GoogleGenerativeAI(geminiCreds.apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    } as any);

    const languageHint = imageLanguage === 'chinese'
      ? 'All text in the image must be in Chinese (中文). '
      : 'All text in the image must be in English. ';

    const userInstruction = `${prompt}\n\n${languageHint}4K, ultra sharp details, professional quality.`;
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: userInstruction }],
          },
        ],
        generationConfig: {
          responseModalities: ['image', 'text'],
        },
      } as any);

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
            return blob;
          }
        }
      }

      throw new Error('响应中未找到图片数据');
    } catch (error) {
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