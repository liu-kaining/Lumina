import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  status: string;
  step: 'enhancing' | 'generating';
  onCancel?: () => void;
}

export function LoadingState({ status, step, onCancel }: LoadingStateProps) {
  const progress = step === 'enhancing' ? 50 : 100;
  const stepText = step === 'enhancing' ? '第 1 步 / 共 2 步' : '第 2 步 / 共 2 步';
  const stepTitle = step === 'enhancing' ? '正在分析文本...' : '正在生成图片...';
  const estimatedTime = step === 'enhancing' ? '约 5-10 秒' : '约 1-5 分钟';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="load-wrap"
    >
      <motion.div
        className="load-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="load-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.div
              className="load-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 />
            </motion.div>
            <div>
              <p className="load-card-title">{stepTitle}</p>
              <p className="load-card-step">{stepText}</p>
            </div>
          </div>
          {onCancel && (
            <motion.button
              type="button"
              onClick={onCancel}
              className="load-cancel-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              title="取消生成"
            >
              <X />
            </motion.button>
          )}
        </div>

        <div className="load-progress-wrap">
          <div className="load-progress-track">
            <motion.div
              className="load-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>

        <div className="load-progress-meta">
          <span className="load-progress-pct">{progress}%</span>
          <span className="load-progress-eta">预计 {estimatedTime}</span>
        </div>

        {status && (
          <motion.p
            className="load-status-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {status}
          </motion.p>
        )}
      </motion.div>

      <motion.div
        className="load-steps-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        <div className={`load-step ${step === 'enhancing' ? 'active' : ''}`}>
          <div className="load-step-inner">
            {step === 'generating' ? <span className="load-step-done">✓</span> : (
              <motion.span
                className="load-step-dot"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ●
              </motion.span>
            )}
            <span>分析文本</span>
          </div>
        </div>
        <div className={`load-step ${step === 'generating' ? 'active' : ''}`}>
          <div className="load-step-inner">
            <motion.span
              className="load-step-dot"
              animate={step === 'generating' ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.4 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ●
            </motion.span>
            <span>生成图片</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="load-placeholder"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="load-placeholder-bg" />
        <div className="load-placeholder-inner">
          <motion.div
            className="load-spinner load-spinner-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <motion.span
              className="load-sparkle"
              animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ✨
            </motion.span>
          </motion.div>
        </div>
        <p className="load-placeholder-text">AI 正在创作中，请稍候...</p>
      </motion.div>

      {onCancel && (
        <motion.button
          type="button"
          onClick={onCancel}
          className="load-cancel-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          取消生成
        </motion.button>
      )}
    </motion.div>
  );
}
