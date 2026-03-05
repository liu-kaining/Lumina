import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

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
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div
            className="confirm-backdrop"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          />
          <motion.div
            className="confirm-dialog"
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 260,
              mass: 0.8,
            }}
          >
            <div className="confirm-box">
              <button
                type="button"
                onClick={onCancel}
                className="confirm-close"
                aria-label="关闭"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
              <div className="confirm-icon-wrap">
                <motion.div
                  className="confirm-icon-circle"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles />
                </motion.div>
              </div>
              <h3 className="confirm-title">{title}</h3>
              <p className="confirm-msg">{message}</p>
              <div className="confirm-btns">
                <motion.button
                  type="button"
                  onClick={onCancel}
                  className="confirm-btn confirm-btn-cancel"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onConfirm}
                  className="confirm-btn confirm-btn-ok"
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
