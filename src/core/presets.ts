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
 * 非默认风格时始终追加风格后缀，确保生图风格一致、不依赖 AI 是否“已整合”
 */
export function applyStyleToPrompt(
  basePrompt: string,
  styleId: string
): string {
  const style = getStylePresetById(styleId);
  
  if (!style || style.id === 'default') {
    return basePrompt;
  }

  return `${basePrompt}, ${style.promptSuffix}`;
}