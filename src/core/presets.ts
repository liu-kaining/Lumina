import { StylePreset } from '../types';

/**
 * 默认风格预设
 * 每种风格都有对应的英文提示词后缀
 */
export const defaultStylePresets: StylePreset[] = [
  {
    id: 'default',
    name: '智能推断',
    nameEn: 'Default',
    emoji: '🎨',
    promptSuffix: '',
    description: '由 AI 自动判断最适合的风格',
  },
  {
    id: 'cinematic',
    name: '电影感',
    nameEn: 'Cinematic',
    emoji: '🎬',
    promptSuffix: 'cinematic lighting, dramatic atmosphere, movie scene, high contrast, professional color grading, depth of field',
    description: '电影级的画面质感和氛围',
  },
  {
    id: 'isometric-3d',
    name: '等距 3D',
    nameEn: 'Isometric 3D',
    emoji: '🏗️',
    promptSuffix: 'isometric 3D render, clean design, minimal geometric shapes, soft lighting, pastel colors, modern illustration',
    description: '等距视角的 3D 插画风格',
  },
  {
    id: 'minimalist',
    name: '极简矢量',
    nameEn: 'Minimalist Flat',
    emoji: '✨',
    promptSuffix: 'minimalist flat design, clean lines, simple shapes, limited color palette, vector illustration, modern graphic design',
    description: '极简的扁平化矢量风格',
  },
  {
    id: 'ghibli',
    name: '吉卜力风',
    nameEn: 'Ghibli Style',
    emoji: '🍃',
    promptSuffix: 'Studio Ghibli style, hand-drawn animation, soft watercolor, dreamy atmosphere, Hayao Miyazaki inspired, whimsical and magical',
    description: '宫崎骏动画电影的手绘风格',
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    nameEn: 'Cyberpunk',
    emoji: '🌆',
    promptSuffix: 'cyberpunk style, neon lights, futuristic cityscape, dark atmosphere, high tech, blade runner aesthetic, glowing effects',
    description: '未来感的赛博朋克风格',
  },
  {
    id: 'watercolor',
    name: '水彩画',
    nameEn: 'Watercolor',
    emoji: '🖌️',
    promptSuffix: 'watercolor painting, soft edges, flowing colors, artistic, hand-painted texture, gentle brushstrokes, dreamy and artistic',
    description: '柔和的水彩画艺术风格',
  },
  {
    id: 'anime',
    name: '日系动漫',
    nameEn: 'Anime',
    emoji: '🌸',
    promptSuffix: 'anime style, vibrant colors, clean lines, Japanese animation, cel shading, expressive characters, dynamic composition',
    description: '日系动漫的绘画风格',
  },
];

/**
 * 根据风格 ID 获取完整配置
 */
export function getStylePresetById(id: string): StylePreset | undefined {
  return defaultStylePresets.find((preset) => preset.id === id);
}

/**
 * 应用风格到 Prompt
 * 现在这个函数主要用于验证风格是否已被 AI 正确整合
 * 对于非默认风格，如果 AI 能够很好地整合风格元素，我们可能不需要再追加后缀
 * 保留逻辑以兼容旧行为，但现在主要起到验证作用
 */
export function applyStyleToPrompt(
  basePrompt: string,
  styleId: string
): string {
  const style = getStylePresetById(styleId);
  
  if (!style) {
    console.warn(`[applyStyleToPrompt] Unknown style ID: ${styleId}, returning base prompt`);
    return basePrompt;
  }

  if (style.id === 'default') {
    return basePrompt;
  }

  // 检查 AI 是否已经整合了该风格的关键元素
  const hasStyleElements = (prompt: string, styleSuffix: string): boolean => {
    // 将后缀拆分为关键元素进行更细致的检查
    const keyElements = styleSuffix.split(', ').map(el => el.toLowerCase().trim());
    const promptLower = prompt.toLowerCase();
    
    // 至少检查几个关键元素是否已经出现在提示词中
    const foundElements = keyElements.filter(el => {
      // 处理像 "cinematic lighting" 这样的词组
      if (el.includes(' ')) {
        const words = el.split(' ');
        // 部分匹配即可
        return words.some(word => word.length > 3 && promptLower.includes(word));
      }
      return promptLower.includes(el);
    });
    
    // 如果找到超过一半的关键元素，认为风格已整合
    return foundElements.length > Math.max(1, keyElements.length / 2);
  };

  // 如果 AI 已经整合了风格元素，我们可以选择不追加后缀
  // 或者追加一个简化的版本作为补充
  if (hasStyleElements(basePrompt, style.promptSuffix)) {
    console.log(`[applyStyleToPrompt] Style "${style.name}" already integrated by AI`);
    // 可选：仍然可以追加一个简化的版本作为确保
    // return `${basePrompt}, ${style.promptSuffix}`;
    return basePrompt;
  }

  // AI 没有充分整合风格，追加完整后缀确保效果
  console.log(`[applyStyleToPrompt] Adding style suffix for "${style.name}"`);
  return `${basePrompt}, ${style.promptSuffix}`;
}