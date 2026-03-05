import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Key, Globe, Cpu, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ProviderConfig, CustomOpenAICredentials } from '../../types';
import './settings.css';

interface SettingsPanelProps {
  onClose: () => void;
}

/** 从 store 的 providers 派生的当前编辑表单项 */
function getFormFromProvider(provider: ProviderConfig | undefined): {
  type: 'gemini' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
} {
  if (!provider) {
    return { type: 'gemini', apiKey: '', baseUrl: '', model: '' };
  }
  const creds = provider.credentials;
  const apiKey = creds && 'apiKey' in creds ? creds.apiKey : '';
  if (provider.type === 'custom' && creds && 'baseUrl' in creds) {
    const c = creds as CustomOpenAICredentials;
    return {
      type: 'custom',
      apiKey,
      baseUrl: c.baseUrl ?? '',
      model: c.textModel ?? c.imageModel ?? '',
    };
  }
  return { type: provider.type, apiKey, baseUrl: '', model: '' };
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { activeProviderId, providers, setActiveProvider, setProviderCredentials } = useAppStore();

  const [editingId, setEditingId] = useState<string>(activeProviderId ?? 'gemini');
  const [form, setForm] = useState(() => {
    const p = providers?.find((x) => x.id === (activeProviderId ?? 'gemini'));
    return getFormFromProvider(p);
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const safeForm = form;

  useEffect(() => {
    const id = activeProviderId ?? 'gemini';
    setEditingId(id);
    const p = providers?.find((x) => x.id === id);
    setForm(getFormFromProvider(p));
  }, [activeProviderId, providers]);

  const handleSelectProvider = (id: string) => {
    setEditingId(id);
    const p = providers?.find((x) => x.id === id);
    setForm(getFormFromProvider(p));
  };

  const handleSave = () => {
    const id = editingId as 'gemini' | 'custom';
    if (id === 'gemini') {
      setProviderCredentials(id, { apiKey: safeForm.apiKey.trim() });
    } else {
      setProviderCredentials(id, {
        apiKey: safeForm.apiKey.trim(),
        baseUrl: safeForm.baseUrl.trim(),
        textModel: safeForm.model.trim() || 'gpt-4o',
        imageModel: safeForm.model.trim() || 'dall-e-3',
      });
    }
    setActiveProvider(id);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const providerOptions = [
    { id: 'gemini', name: 'Google Gemini', icon: '🌟', desc: '使用 Gemini 3.1 Pro 模型' },
    { id: 'custom', name: 'Custom OpenAI', icon: '🔧', desc: '兼容 OpenAI API 格式' },
  ];

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="settings-panel"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2 className="settings-title">设置</h2>
          <button type="button" onClick={onClose} className="settings-close-btn" aria-label="关闭">
            <X />
          </button>
        </div>

        <div className="settings-section">
          <label className="settings-label">AI Provider</label>
          <div className="settings-options">
            {providerOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProvider(p.id)}
                className={`settings-option-btn ${editingId === p.id ? 'selected' : ''}`}
              >
                <span className="option-icon">{p.icon}</span>
                <div className="option-body">
                  <div className="option-name">{p.name}</div>
                  <div className="option-desc">{p.desc}</div>
                </div>
                {editingId === p.id && <Check className="option-check" />}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <label className="settings-label-inline">
            <Key />
            API Key
          </label>
          <div className="settings-input-wrap">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={safeForm.apiKey}
              onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              placeholder="输入您的 API Key"
              className="settings-input"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="settings-input-toggle"
              aria-label={showApiKey ? '隐藏' : '显示'}
            >
              {showApiKey ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <p className="settings-hint">
            <AlertCircle />
            API Key 仅存储在本地，不会上传到任何服务器
          </p>
        </div>

        {editingId === 'custom' && (
          <>
            <div className="settings-section">
              <label className="settings-label-inline">
                <Globe />
                Base URL
              </label>
              <input
                type="text"
                value={safeForm.baseUrl}
                onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="settings-input"
              />
            </div>

            <div className="settings-section">
              <label className="settings-label-inline">
                <Cpu />
                模型名称
              </label>
              <input
                type="text"
                value={safeForm.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="gpt-4-vision-preview"
                className="settings-input"
              />
            </div>
          </>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!safeForm.apiKey.trim()}
          className={`settings-save-btn ${saved ? 'saved' : ''}`}
        >
          {saved ? (
            <>
              <Check />
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
