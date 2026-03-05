import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Key, Globe, Cpu, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { provider, setProvider } = useAppStore();
  const [localProvider, setLocalProvider] = useState(provider);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalProvider(provider);
  }, [provider]);

  const handleSave = () => {
    setProvider(localProvider);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const providers = [
    { id: 'gemini', name: 'Google Gemini', icon: '🌟', desc: '使用 Gemini 3.1 Pro 模型' },
    { id: 'custom', name: 'Custom OpenAI', icon: '🔧', desc: '兼容 OpenAI API 格式' },
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">设置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Provider 选择 */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">AI Provider</label>
          <div className="space-y-2">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setLocalProvider({ ...localProvider, type: p.id as 'gemini' | 'custom' })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  localProvider.type === p.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.desc}</div>
                </div>
                {localProvider.type === p.id && (
                  <Check className="w-5 h-5 text-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={localProvider.apiKey}
              onChange={(e) => setLocalProvider({ ...localProvider, apiKey: e.target.value })}
              placeholder="输入您的 API Key"
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            API Key 仅存储在本地，不会上传到任何服务器
          </p>
        </div>

        {/* Custom Provider 配置 */}
        {localProvider.type === 'custom' && (
          <>
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Base URL
              </label>
              <input
                type="text"
                value={localProvider.baseUrl}
                onChange={(e) => setLocalProvider({ ...localProvider, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                模型名称
              </label>
              <input
                type="text"
                value={localProvider.model}
                onChange={(e) => setLocalProvider({ ...localProvider, model: e.target.value })}
                placeholder="gpt-4-vision-preview"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </>
        )}

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={!localProvider.apiKey.trim()}
          className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-green-500 text-white'
              : localProvider.apiKey.trim()
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              已保存
            </>
          ) : (
            '保存设置'
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}