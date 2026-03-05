import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-white/90 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 对话框 */}
          <motion.div
            className="relative z-10 w-full max-w-sm mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
              {/* 关闭按钮 */}
              <button
                onClick={onCancel}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 图标 */}
              <div className="flex justify-center mb-4">
                <motion.div
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
              </div>

              {/* 标题 */}
              <h3 className="text-gray-800 text-lg font-semibold text-center mb-2">
                {title}
              </h3>

              {/* 消息 */}
              <p className="text-gray-500 text-sm text-center mb-6">
                {message}
              </p>

              {/* 按钮组 */}
              <div className="flex gap-3">
                <motion.button
                  onClick={onCancel}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium',
                    'bg-gray-100 hover:bg-gray-200 text-gray-600',
                    'border border-gray-200 transition-colors'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelText}
                </motion.button>

                <motion.button
                  onClick={onConfirm}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium',
                    'bg-gradient-to-r from-amber-500 to-orange-500',
                    'text-white shadow-lg transition-colors'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}