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
    imageLanguage: ImageLanguage = 'chinese'
  ): Promise<string> {
    const customCreds = credentials as CustomOpenAICredentials;

    // 使用提示词优化模型配置
    const { baseUrl, apiKey, modelName } = customCreds.textModel;

    if (!apiKey || !baseUrl || !modelName) {
      throw new Error('提示词优化模型配置不完整');
    }

    const languageInstruction = imageLanguage === 'chinese'
      ? `CRITICAL: The generated image MUST display ALL text in CHINESE CHARACTERS (中文字符). This is non-negotiable. Any text, labels, titles, captions, or words in the image MUST be rendered in clear, legible Chinese characters (汉字). Do NOT use English text anywhere in the image. Ensure Chinese text is sharp, high-contrast, and professionally typeset.`
      : `CRITICAL: The generated image MUST display ALL text in ENGLISH. Any text, labels, titles, captions, or words in the image MUST be rendered in clear, legible English. Ensure text is sharp, high-contrast, and professionally typeset.`;

    // 获取风格信息
    const stylePreset = getStylePresetById(style);
    
    const systemPrompt = `You are an expert image prompt engineer specializing in creating high-quality image generation prompts with clear, legible text rendering${stylePreset && stylePreset.id !== 'default' ? ` and specific artistic style integration.` : '.'}

Guidelines:
- Transform the user's selected text into a vivid, detailed visual description
- Consider the context when relevant${stylePreset && stylePreset.id !== 'default' ? `
- CRITICAL: You MUST deeply incorporate the "${stylePreset.nameEn}" (${stylePreset.name}) style into the prompt.
  Style characteristics: ${stylePreset.description}
  Key visual elements: ${stylePreset.promptSuffix}
  The style should influence lighting, color palette, composition, and overall aesthetic.` : ''}
- Use professional photography and art terminology
- Include details about lighting, composition, mood, and style
- ALWAYS include quality requirements: "8K resolution, ultra high quality, sharp details, professional photography, high-resolution output"
- For text rendering: Specify "clear, sharp, high-contrast text, professional typography, legible fonts, crisp text edges"
- Make the prompt suitable for AI image generation
- Output ONLY the enhanced prompt, nothing else
- Keep the prompt concise but descriptive (80-200 words)
${languageInstruction}`;

    const userPrompt = `Context: ${context || 'No additional context provided'}

Selected text: "${text}"${stylePreset && stylePreset.id !== 'default' ? `

Artistic style to integrate: ${stylePreset.nameEn} (${stylePreset.name})
Style description: ${stylePreset.description}
Key visual elements: ${stylePreset.promptSuffix}` : ''}

Please create an enhanced image generation prompt based on the selected text and context.${stylePreset && stylePreset.id !== 'default' ? ` IMPORTANT: The "${stylePreset.nameEn}" style MUST be deeply integrated into the prompt's core concept, not just an afterthought.` : ''} Remember: the image MUST contain ${imageLanguage === 'chinese' ? 'CHINESE (中文)' : 'ENGLISH'} text if there are any words in the image.`;

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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const enhancedPrompt = data.choices?.[0]?.message?.content;
      
      if (!enhancedPrompt || enhancedPrompt.trim() === '') {
        // 检查是否返回的提示词就是原始文本（可能说明AI没有正确优化）
        const normalizedInput = text.trim().toLowerCase().replace(/\s+/g, ' ');
        const normalizedOutput = enhancedPrompt?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
        
        if (normalizedOutput === normalizedInput || !enhancedPrompt) {
          throw new Error('AI 未能优化提示词，返回了原始文本或无内容');
        }
      }

      console.log('[CustomAdapter] Enhanced prompt:', enhancedPrompt.substring(0, 200) + '...');
      console.log('[CustomAdapter] Original text:', text.substring(0, 100) + '...');

      // 应用风格
      const finalPrompt = applyStyleToPrompt(enhancedPrompt, style);

      console.log('[CustomAdapter] Final prompt with style:', finalPrompt.substring(0, 200) + '...');
      return finalPrompt;
    } catch (error) {
      console.error('Custom Provider Prompt enhancement failed:', error);
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
    imageLanguage: ImageLanguage = 'chinese'
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
      console.error('Custom Provider Image generation failed:', error);
      throw new Error(`图片生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}