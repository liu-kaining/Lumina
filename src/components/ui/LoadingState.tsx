import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingStateProps {
  status: string;
  step: 'enhancing' | 'generating';
  onCancel?: () => void;
}

export function LoadingState({ status, step, onCancel }: LoadingStateProps) {
  const progress = step === 'enhancing' ? 50 : 100;
  const stepText = step === 'enhancing' ? '第 1 步 / 共 2 步' : '第 2 步 / 共 2 步';
  const stepTitle = step === 'enhancing' ? '正在分析文本...' : '正在生成图片...';
  const estimatedTime = step === 'enhancing' ? '约 5-10 秒' : '约 10-20 秒';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* 状态卡片 */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        {/* 标题和步骤 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <p className="text-gray-800 font-medium text-sm">{stepTitle}</p>
              <p className="text-gray-400 text-xs">{stepText}</p>
            </div>
          </div>
          
          {onCancel && (
            <motion.button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="取消生成"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* 进度条 */}
        <div className="mb-3">
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* 进度条末端光点 */}
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* 进度百分比和预计时间 */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-600 font-medium">{progress}%</span>
          <span className="text-gray-400">预计 {estimatedTime}</span>
        </div>

        {/* 详细状态 */}
        {status && (
          <motion.p
            className="text-gray-500 text-xs mt-3 truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {status}
          </motion.p>
        )}
      </div>

      {/* 步骤指示器 */}
      <div className="flex gap-2">
        <div className={cn(
          'flex-1 py-2 px-3 rounded-lg text-center text-xs transition-all',
          step === 'enhancing'
             ? 'bg-amber-50 text-amber-600 border border-amber-200'
             : 'bg-gray-50 text-gray-400 border border-gray-200'
        )}>
          <div className="flex items-center justify-center gap-1">
            {step === 'generating' ? (
              <span className="text-green-500">✓</span>
            ) : (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ●
              </motion.span>
            )}
            <span>分析文本</span>
          </div>
        </div>
        
        <div className={cn(
          'flex-1 py-2 px-3 rounded-lg text-center text-xs transition-all',
          step === 'generating'
             ? 'bg-amber-50 text-amber-600 border border-amber-200'
             : 'bg-gray-50 text-gray-400 border border-gray-200'
        )}>
          <div className="flex items-center justify-center gap-1">
            <motion.span
              animate={step === 'generating' ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ●
            </motion.span>
            <span>生成图片</span>
          </div>
        </div>
      </div>

      {/* 图片预览占位 */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-amber-50 border border-amber-100">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-transparent to-orange-100/50"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* 动态波纹效果 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 rounded-full border border-amber-300/30"
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              ✨
            </motion.span>
          </motion.div>
        </div>

        {/* 提示文字 */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-gray-400 text-xs text-center">
            AI 正在创作中，请稍候...
          </p>
        </div>
      </div>

      {/* 取消按钮 */}
      {onCancel && (
        <motion.button
          onClick={onCancel}
          className="w-full py-3 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          取消生成
        </motion.button>
      )}
    </motion.div>
  );
}