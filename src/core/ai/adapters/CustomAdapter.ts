import { AIProvider } from '../interfaces';
import { CustomOpenAICredentials, ProviderCredentials, ImageLanguage } from '../../../types';
import { applyStyleToPrompt, getStylePresetById } from '../../presets';

/**
 * Custom OpenAI 兼容 Provider 适配器
 * 支持任何兼容 OpenAI API 格式的服务
 * 提示词优化模型和生图模型可独立配置
 */
export class CustomAdapter implements AIProvider {
  id = 'custom';
  name = 'Custom OpenAI';
  type = 'custom' as const;

  /**
   * 增强 Prompt
   * 使用 textModel 配置
   */
  async enhancePrompt(
    text: string,
    context: string,
    style: string,
    credentials: ProviderCredentials,
    imageLanguage: ImageLanguage = 'chinese',
    signal?: AbortSignal,
    pageTitle?: string
  ): Promise<string> {
    const customCreds = credentials as CustomOpenAICredentials;

    // 使用提示词优化模型配置
    const { baseUrl, apiKey, modelName } = customCreds.textModel;

    if (!apiKey || !baseUrl || !modelName) {
      throw new Error('提示词优化模型配置不完整');
    }

    const languageInstruction = imageLanguage === 'chinese'
      ? `CRITICAL: Any text shown IN the image MUST be in CHINESE (中文), clear and legible.`
      : `CRITICAL: Any text shown IN the image MUST be in ENGLISH, clear and legible.`;

    const stylePreset = getStylePresetById(style);
    
    const systemPrompt = `You are an expert at writing prompts for AI image generation (e.g. DALL·E, Midjourney). Your output will be used directly to generate an image. Do NOT just paraphrase or repeat the user's text.

Your output MUST be a single, detailed IMAGE PROMPT that describes the SCENE to be drawn. Include:
- Subject: what is shown (characters, objects, setting)
- Composition: framing, camera angle, layout
- Lighting: type of light, mood, shadows
- Style: visual style (e.g. cinematic, illustration, 3D render)
- Quality: 8K, ultra high quality, sharp details, professional
${stylePreset && stylePreset.id !== 'default' ? `- You MUST weave in this artistic style: ${stylePreset.nameEn}. ${stylePreset.description}. Key elements: ${stylePreset.promptSuffix}` : ''}

Rules:
- Output ONLY the image prompt. No explanations, no "Here is...", no markdown.
- Length: 80–200 words. Be specific and visual.
- Write in English. ${languageInstruction}`;

    const userPrompt = `Page title: ${pageTitle || '(not provided)'}
Context (snippet): ${context || '—'}

User's selected text (turn this into a full image prompt, do not just copy):
"${text}"${stylePreset && stylePreset.id !== 'default' ? `

Required style: ${stylePreset.nameEn} — integrate it into the scene (lighting, colors, mood).` : ''}

Generate one image prompt that fully describes the scene to draw.`;

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const enhancedPrompt = data.choices?.[0]?.message?.content;
      
      if (!enhancedPrompt || enhancedPrompt.trim() === '') {
        throw new Error('AI 未能优化提示词，返回了空内容');
      }
      
      const normalizedInput = text.trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedOutput = enhancedPrompt.trim().toLowerCase().replace(/\s+/g, ' ');
      
      if (normalizedOutput === normalizedInput) {
        throw new Error('AI 未能优化提示词，返回了原始文本');
      }

      const finalPrompt = applyStyleToPrompt(enhancedPrompt, style);
      return finalPrompt;
    } catch (error) {
      throw new Error(`Prompt 增强失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 生成图片
   * 使用 imageModel 配置
   */
  async generateImage(
    prompt: string,
    credentials: ProviderCredentials,
    imageLanguage: ImageLanguage = 'chinese',
    signal?: AbortSignal
  ): Promise<Blob> {
    const customCreds = credentials as CustomOpenAICredentials;

    // 使用生图模型配置
    const { baseUrl, apiKey, modelName } = customCreds.imageModel;

    if (!apiKey || !baseUrl || !modelName) {
      throw new Error('生图模型配置不完整');
    }

    const languageHint = imageLanguage === 'chinese'
      ? 'CRITICAL REQUIREMENT: ALL text, labels, titles, and captions in the image MUST be rendered in clear, sharp CHINESE CHARACTERS (汉字/中文). Use high-contrast, professional typography. Generate in the highest possible resolution with ultra sharp details. '
      : 'CRITICAL REQUIREMENT: ALL text, labels, titles, and captions in the image MUST be rendered in clear, sharp ENGLISH. Use high-contrast, professional typography. Generate in the highest possible resolution with ultra sharp details. ';

    try {
      // 使用 1792x1024 获得更大尺寸的图片 (DALL-E 3 支持的最大尺寸)
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          prompt: languageHint + prompt,
          n: 1,
          size: '1792x1024',
          quality: 'hd',
          response_format: 'b64_json',
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const imageData = data.data?.[0]?.b64_json;

      if (!imageData) {
        throw new Error('响应中未找到图片数据');
      }

      // 将 base64 转换为 Blob
      const byteCharacters = atob(imageData);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      return blob;
    } catch (error) {
      throw new Error(`图片生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}