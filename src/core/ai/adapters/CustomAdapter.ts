import { AIProvider } from '../interfaces';
import { CustomOpenAICredentials, ProviderCredentials, ImageLanguage } from '../../../types';
import { applyStyleToPrompt } from '../../presets';

/**
 * Custom OpenAI 兼容 Provider 适配器
 * 支持任何兼容 OpenAI API 格式的服务
 */
export class CustomAdapter implements AIProvider {
  id = 'custom';
  name = 'Custom OpenAI';
  type = 'custom' as const;

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
    const customCreds = credentials as CustomOpenAICredentials;

    if (!customCreds.apiKey || !customCreds.baseUrl || !customCreds.textModel) {
      throw new Error('Custom Provider 配置不完整');
    }

    const languageInstruction = imageLanguage === 'chinese'
      ? `IMPORTANT: The generated image MUST display text in CHINESE (中文). When the image contains any text, labels, or words, they must be in Chinese characters.`
      : `IMPORTANT: The generated image MUST display text in ENGLISH. When the image contains any text, labels, or words, they must be in English.`;

    const systemPrompt = `You are an expert image prompt engineer. Your task is to transform the given text into a high-quality, detailed image generation prompt.

Guidelines:
- Transform the user's selected text into a vivid, detailed visual description
- Consider the context when relevant
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
      const response = await fetch(`${customCreds.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customCreds.apiKey}`,
        },
        body: JSON.stringify({
          model: customCreds.textModel,
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
      const enhancedPrompt = data.choices?.[0]?.message?.content || text;

      // 应用风格
      const finalPrompt = applyStyleToPrompt(enhancedPrompt, style);

      return finalPrompt;
    } catch (error) {
      console.error('Custom Provider Prompt enhancement failed:', error);
      throw new Error(`Prompt 增强失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
    const customCreds = credentials as CustomOpenAICredentials;

    if (!customCreds.apiKey || !customCreds.baseUrl || !customCreds.imageModel) {
      throw new Error('Custom Provider 配置不完整');
    }

    const languageHint = imageLanguage === 'chinese'
      ? 'IMPORTANT: Any text in the image must be in Chinese (中文). Generate in 4K resolution with ultra sharp details. '
      : 'IMPORTANT: Any text in the image must be in English. Generate in 4K resolution with ultra sharp details. ';

    try {
      const response = await fetch(`${customCreds.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customCreds.apiKey}`,
        },
        body: JSON.stringify({
          model: customCreds.imageModel,
          prompt: languageHint + prompt,
          n: 1,
          size: '1024x1024',
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