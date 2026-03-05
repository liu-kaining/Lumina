import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, ProviderConfig, ProviderCredentials, ImageLanguage } from '../types';

/**
 * 默认 Provider 配置
 */
const defaultProviders: ProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
  },
  {
    id: 'custom',
    name: 'Custom OpenAI',
    type: 'custom',
  },
];

/**
 * 应用状态 Store
 * 使用 Zustand 管理，配置信息持久化到 chrome.storage.local
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      activeProviderId: 'gemini',
      providers: defaultProviders,

      selectedText: '',
      pageContext: '',
      pageTitle: '',

      isGenerating: false,
      currentStyle: 'default',
      imageLanguage: 'chinese' as ImageLanguage,

      // Actions
      setActiveProvider: (id: string) => {
        set({ activeProviderId: id });
      },

      setProviderCredentials: (id: string, credentials: ProviderCredentials) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, credentials } : p
          ),
        }));
      },

      setSelectedText: (text: string, context: string, title: string) => {
        set({
          selectedText: text,
          pageContext: context,
          pageTitle: title,
        });
      },

      setGenerating: (status: boolean) => {
        set({ isGenerating: status });
      },

      setCurrentStyle: (style: string) => {
        set({ currentStyle: style });
      },

      setImageLanguage: (language: ImageLanguage) => {
        set({ imageLanguage: language });
      },
    }),
    {
      name: 'lucidmark-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string): Promise<string | null> => {
          const result = await browser.storage.local.get(name);
          const value = result[name];
          return typeof value === 'string' ? value : null;
        },
        setItem: async (name: string, value: string): Promise<void> => {
          await browser.storage.local.set({ [name]: value });
        },
        removeItem: async (name: string): Promise<void> => {
          await browser.storage.local.remove(name);
        },
      })),
      // 只持久化配置信息，不持久化临时状态
      partialize: (state) => ({
        activeProviderId: state.activeProviderId,
        providers: state.providers,
        currentStyle: state.currentStyle,
        imageLanguage: state.imageLanguage,
      }),
    }
  )
);