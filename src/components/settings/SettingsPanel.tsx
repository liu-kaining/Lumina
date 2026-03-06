import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Key, Globe, Cpu, AlertCircle, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles, Image } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ProviderConfig, ModelConfig } from '../../types';
import './settings.css';

interface SettingsPanelProps {
  onClose: () => void;
}

/** 默认模型配置 */
const defaultModelConfig: ModelConfig = {
  baseUrl: '',
  apiKey: '',
  modelName: '',
};

/** 从 store 的 providers 派生的当前编辑表单项 */
function getFormFromProvider(provider: ProviderConfig | undefined): {
  type: 'gemini' | 'custom';
  apiKey: string;
  textModel: ModelConfig;
  imageModel: ModelConfig;
} {
  if (!provider) {
    return { type: 'gemini', apiKey: '', textModel: { ...defaultModelConfig }, imageModel: { ...defaultModelConfig } };
  }
  const creds = provider.credentials;

  // Gemini 配置
  if (provider.type === 'gemini') {
    const apiKey = creds && 'apiKey' in creds ? creds.apiKey : '';
    return { type: 'gemini', apiKey, textModel: { ...defaultModelConfig }, imageModel: { ...defaultModelConfig } };
  }

  // Custom OpenAI 配置
  if (provider.type === 'custom' && creds && 'textModel' in creds && 'imageModel' in creds) {
    return {
      type: 'custom',
      apiKey: '',
      textModel: creds.textModel ?? { ...defaultModelConfig },
      imageModel: creds.imageModel ?? { ...defaultModelConfig },
    };
  }

  return { type: provider.type, apiKey: '', textModel: { ...defaultModelConfig }, imageModel: { ...defaultModelConfig } };
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { activeProviderId, providers, setActiveProvider, setProviderCredentials } = useAppStore();

  const [editingId, setEditingId] = useState<string>(activeProviderId ?? 'gemini');
  const [form, setForm] = useState(() => {
    const p = providers?.find((x) => x.id === (activeProviderId ?? 'gemini'));
    return getFormFromProvider(p);
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTextModelApiKey, setShowTextModelApiKey] = useState(false);
  const [showImageModelApiKey, setShowImageModelApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandTextModel, setExpandTextModel] = useState(true);
  const [expandImageModel, setExpandImageModel] = useState(true);

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
    setShowApiKey(false);
    setShowTextModelApiKey(false);
    setShowImageModelApiKey(false);
  };

  const handleSave = () => {
    const id = editingId as 'gemini' | 'custom';
    if (id === 'gemini') {
      setProviderCredentials(id, { apiKey: safeForm.apiKey.trim() });
    } else {
      // 对模型名进行智能处理：如果用户输入了内容但全是空格，则视为空
      const textModelName = safeForm.textModel.modelName.trim();
      const imageModelName = safeForm.imageModel.modelName.trim();
      
      // 验证 Base URL 格式 - 建议但不强制
      const textBaseUrl = safeForm.textModel.baseUrl.trim();
      const imageBaseUrl = safeForm.imageModel.baseUrl.trim();
      
      [textBaseUrl, imageBaseUrl].forEach((url) => {
        if (url && !url.endsWith('/v1') && !url.endsWith('/v1/')) {
          console.warn(`Base URL 可能格式不正确: ${url}. OpenAI 兼容 API 通常需要 /v1 路径`);
        }
      });
      
      setProviderCredentials(id, {
        textModel: {
          baseUrl: textBaseUrl,
          apiKey: safeForm.textModel.apiKey.trim(),
          modelName: textModelName || 'gpt-4o', // 空字符串才用默认值
        },
        imageModel: {
          baseUrl: imageBaseUrl,
          apiKey: safeForm.imageModel.apiKey.trim(),
          modelName: imageModelName || 'dall-e-3', // 空字符串才用默认值
        },
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
    { id: 'gemini', name: 'Google Gemini', icon: '🌟', desc: '使用 Gemini 多模态模型' },
    { id: 'custom', name: 'Custom OpenAI', icon: '🔧', desc: '兼容 OpenAI API 格式' },
  ];

  // 检查 Custom OpenAI 是否可以保存
  const canSaveCustom = safeForm.type === 'custom' &&
    safeForm.textModel.apiKey.trim() &&
    safeForm.textModel.baseUrl.trim() &&
    safeForm.textModel.modelName.trim() &&
    safeForm.imageModel.apiKey.trim() &&
    safeForm.imageModel.baseUrl.trim() &&
    safeForm.imageModel.modelName.trim();

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

        {editingId === 'gemini' && (
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
        )}

        {editingId === 'custom' && (
          <>
            {/* 提示词优化模型配置 */}
            <div className="settings-model-section">
              <button
                type="button"
                onClick={() => setExpandTextModel(!expandTextModel)}
                className="settings-model-header"
              >
                <span className="settings-model-title">
                  <Sparkles size={16} />
                  提示词优化模型
                </span>
                {expandTextModel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandTextModel && (
                <div className="settings-model-body">
                  <div className="settings-field">
                    <label className="settings-field-label">
                      <Globe size={14} />
                      Base URL
                    </label>
                    <input
                      type="text"
                      value={safeForm.textModel.baseUrl}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        textModel: { ...f.textModel, baseUrl: e.target.value }
                      }))}
                      placeholder="https://api.openai.com/v1"
                      className="settings-input"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">
                      <Key size={14} />
                      API Key
                    </label>
                    <div className="settings-input-wrap">
                      <input
                        type={showTextModelApiKey ? 'text' : 'password'}
                        value={safeForm.textModel.apiKey}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          textModel: { ...f.textModel, apiKey: e.target.value }
                        }))}
                        placeholder="输入 API Key"
                        className="settings-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTextModelApiKey(!showTextModelApiKey)}
                        className="settings-input-toggle"
                        aria-label={showTextModelApiKey ? '隐藏' : '显示'}
                      >
                        {showTextModelApiKey ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">
                      <Cpu size={14} />
                      模型名称
                    </label>
                    <input
                      type="text"
                      value={safeForm.textModel.modelName}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        textModel: { ...f.textModel, modelName: e.target.value }
                      }))}
                      placeholder="gpt-4o"
                      className="settings-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 生图模型配置 */}
            <div className="settings-model-section">
              <button
                type="button"
                onClick={() => setExpandImageModel(!expandImageModel)}
                className="settings-model-header"
              >
                <span className="settings-model-title">
                  <Image size={16} />
                  生图模型
                </span>
                {expandImageModel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandImageModel && (
                <div className="settings-model-body">
                  <div className="settings-field">
                    <label className="settings-field-label">
                      <Globe size={14} />
                      Base URL
                    </label>
                    <input
                      type="text"
                      value={safeForm.imageModel.baseUrl}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        imageModel: { ...f.imageModel, baseUrl: e.target.value }
                      }))}
                      placeholder="https://api.openai.com/v1"
                      className="settings-input"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">
                      <Key size={14} />
                      API Key
                    </label>
                    <div className="settings-input-wrap">
                      <input
                        type={showImageModelApiKey ? 'text' : 'password'}
                        value={safeForm.imageModel.apiKey}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          imageModel: { ...f.imageModel, apiKey: e.target.value }
                        }))}
                        placeholder="输入 API Key"
                        className="settings-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowImageModelApiKey(!showImageModelApiKey)}
                        className="settings-input-toggle"
                        aria-label={showImageModelApiKey ? '隐藏' : '显示'}
                      >
                        {showImageModelApiKey ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">
                      <Cpu size={14} />
                      模型名称
                    </label>
                    <input
                      type="text"
                      value={safeForm.imageModel.modelName}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        imageModel: { ...f.imageModel, modelName: e.target.value }
                      }))}
                      placeholder="dall-e-3"
                      className="settings-input"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={safeForm.type === 'gemini' ? !safeForm.apiKey.trim() : !canSaveCustom}
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
