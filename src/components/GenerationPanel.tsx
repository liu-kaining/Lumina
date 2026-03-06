import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { LoadingState } from './ui/LoadingState';
import { StyleSelector } from './ui/StyleSelector';
import { LanguageSelector } from './ui/LanguageSelector';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useAppStore } from '../store/useAppStore';
import { AIService } from '../core/ai-service';
import { dbOperations } from '../core/db';
import { ProviderConfig } from '../types';

interface GenerationPanelProps {
  onGenerated?: (imageId: number) => void;
}

export function GenerationPanel({ onGenerated }: GenerationPanelProps) {
  const {
    selectedText,
    pageContext,
    pageTitle,
    activeProviderId,
    providers,
    currentStyle,
    setCurrentStyle,
    imageLanguage,
    setImageLanguage,
    setGenerating,
    isGenerating,
  } = useAppStore();

  const [refinedPrompt, setRefinedPrompt] = useState<string>('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'enhancing' | 'generating'>('enhancing');
  const [error, setError] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeProvider = providers.find((p: ProviderConfig) => p.id === activeProviderId);

  // 检查是否已配置凭证
  const hasCredentials = (() => {
    if (!activeProvider?.credentials) return false;
    // Gemini: 检查 apiKey
    if ('apiKey' in activeProvider.credentials) {
      return !!activeProvider.credentials.apiKey;
    }
    // Custom OpenAI: 检查 textModel 和 imageModel 的 apiKey
    if ('textModel' in activeProvider.credentials && 'imageModel' in activeProvider.credentials) {
      return !!activeProvider.credentials.textModel?.apiKey && !!activeProvider.credentials.imageModel?.apiKey;
    }
    return false;
  })();

  const handleGenerate = async () => {
    if (!selectedText || !hasCredentials || isGenerating) return;

    setShowConfirm(false);
    setGenerating(true);
    setError('');
    setRefinedPrompt('');
    setCurrentStep('enhancing');

    // 创建 AbortController 用于取消
    abortControllerRef.current = new AbortController();

    try {
      const imageId = await AIService.generateAndSaveImage({
        providerId: activeProviderId,
        credentials: activeProvider!.credentials!,
        selectedText,
        context: pageContext,
        pageTitle,
        style: currentStyle,
        imageLanguage,
        onProgress: (step: 'enhancing' | 'generating', message: string) => {
          setCurrentStep(step);
          setStatus(message);
        },
      });

      // 获取增强后的 Prompt
      const record = await dbOperations.getImageById(imageId);
      if (record) {
        setRefinedPrompt(record.refinedPrompt);
      }

      onGenerated?.(imageId);
    } catch (err) {
      // 如果是取消操作，不显示错误
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGenerating(false);
      setStatus('');
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setGenerating(false);
    setStatus('');
    abortControllerRef.current = null;
  };

  return (
    <div className="gen-wrap">
      <div className="gen-section">
        <label className="gen-label">风格预设</label>
        <StyleSelector
          value={currentStyle}
          onChange={setCurrentStyle}
          disabled={isGenerating}
        />
      </div>

      <div className="gen-section">
        <label className="gen-label">图片文字语言</label>
        <LanguageSelector
          value={imageLanguage}
          onChange={setImageLanguage}
          disabled={isGenerating}
        />
      </div>

      {refinedPrompt && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="gen-prompt-box"
        >
          <button
            type="button"
            onClick={() => setShowPrompt(!showPrompt)}
            className="gen-prompt-toggle"
          >
            <span>
              <Sparkles />
              Prompt 棱镜
            </span>
            {showPrompt ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
          </button>
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="gen-prompt-body"
              >
                <p>{refinedPrompt}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gen-error-box"
        >
          <AlertCircle />
          <div>
            <p className="gen-error-title">
              {error.includes('429') || error.includes('quota') ? 'API 配额已用尽' : '生成失败'}
            </p>
            <p className="gen-error-desc">
              {error.includes('429') || error.includes('quota')
                ? 'Gemini 免费版有请求限制，请稍后再试或升级到付费计划'
                : error}
            </p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <LoadingState
            key="loading"
            status={status}
            step={currentStep}
            onCancel={handleCancel}
          />
        ) : (
          <motion.button
            key="button"
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!selectedText || !hasCredentials}
            className="gen-btn"
            whileHover={{ scale: selectedText && hasCredentials ? 1.02 : 1 }}
            whileTap={{ scale: selectedText && hasCredentials ? 0.98 : 1 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Sparkles />
              生成配图
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirm}
        title="开始生成配图？"
        message={`将使用「${currentStyle}」风格，图片文字为${imageLanguage === 'chinese' ? '中文' : '英文'}，预计需要 10-30 秒。`}
        confirmText="开始生成"
        cancelText="取消"
        onConfirm={handleGenerate}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}