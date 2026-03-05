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
import { cn } from '../lib/utils';
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
  const hasCredentials = activeProvider?.credentials && 'apiKey' in activeProvider.credentials
    ? !!activeProvider.credentials.apiKey
    : false;

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
    <div className="space-y-4">
      {/* 风格选择 */}
      <div>
        <label className="text-gray-500 text-xs mb-2 block font-medium">风格预设</label>
        <StyleSelector
          value={currentStyle}
          onChange={setCurrentStyle}
          disabled={isGenerating}
        />
      </div>

      {/* 语言选择 */}
      <div>
        <label className="text-gray-500 text-xs mb-2 block font-medium">图片文字语言</label>
        <LanguageSelector
          value={imageLanguage}
          onChange={setImageLanguage}
          disabled={isGenerating}
        />
      </div>

      {/* Prompt 棱镜 */}
      {refinedPrompt && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl overflow-hidden bg-white/60 border border-orange-100"
        >
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="w-full px-4 py-3 flex items-center justify-between text-gray-600 text-sm hover:bg-orange-50/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Prompt 棱镜
            </span>
            {showPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4"
              >
                <p className="text-gray-500 text-sm leading-relaxed">
                  {refinedPrompt}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm font-medium mb-1">
              {error.includes('429') || error.includes('quota') ? 'API 配额已用尽' : '生成失败'}
            </p>
            <p className="text-red-600/70 text-xs">
              {error.includes('429') || error.includes('quota')
                ? 'Gemini 免费版有请求限制，请稍后再试或升级到付费计划'
                : error}
            </p>
          </div>
        </motion.div>
      )}

      {/* 生成按钮 / 进度 */}
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
            onClick={() => setShowConfirm(true)}
            disabled={!selectedText || !hasCredentials}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-lg',
              'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500',
              'text-white shadow-lg shadow-orange-500/25',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
              'transition-all duration-200',
              'hover:shadow-xl hover:shadow-orange-500/30'
            )}
            whileHover={{ scale: selectedText && hasCredentials ? 1.02 : 1 }}
            whileTap={{ scale: selectedText && hasCredentials ? 0.98 : 1 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              生成配图
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 确认弹窗 */}
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