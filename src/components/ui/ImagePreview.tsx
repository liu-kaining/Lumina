import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { dbOperations } from '../../core/db';

interface ImagePreviewProps {
  isOpen: boolean;
  imageId: number | null;
  imageUrl: string | null;
  onClose: () => void;
  onDelete?: () => void;
}

export function ImagePreview({ isOpen, imageId, imageUrl, onClose, onDelete }: ImagePreviewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lucidmark-${imageId}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageId || isDeleting) return;
    setIsDeleting(true);
    try {
      await dbOperations.deleteImage(imageId);
      setShowDeleteConfirm(false);
      onDelete?.();
      onClose();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          className="preview-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="preview-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="preview-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="preview-close"
              aria-label="关闭"
            >
              <X />
            </button>
            <motion.img
              src={imageUrl}
              alt="预览"
              className="preview-img"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              draggable={false}
            />
            <div className="preview-actions">
              <motion.button
                type="button"
                onClick={handleDownload}
                className="preview-btn preview-btn-download"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="下载图片"
              >
                <Download />
                下载
              </motion.button>
              <motion.button
                type="button"
                onClick={handleDeleteClick}
                className="preview-btn preview-btn-delete"
                disabled={isDeleting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="删除图片"
              >
                <Trash2 />
                删除
              </motion.button>
            </div>
          </motion.div>

          {/* 删除确认弹窗 */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                className="preview-overlay"
                style={{ zIndex: 100 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="preview-backdrop"
                  onClick={handleDeleteCancel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.div
                  className="confirm-dialog"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25 }}
                >
                  <div className="confirm-box">
                    <button
                      type="button"
                      onClick={handleDeleteCancel}
                      className="confirm-close"
                      aria-label="关闭"
                    >
                      <X style={{ width: 16, height: 16 }} />
                    </button>
                    <div className="confirm-icon-wrap">
                      <motion.div
                        className="confirm-icon-circle"
                        style={{ background: '#dc2626' }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <AlertTriangle style={{ width: 28, height: 28, color: '#fff' }} />
                      </motion.div>
                    </div>
                    <h3 className="confirm-title">确认删除图片？</h3>
                    <p className="confirm-msg">删除后将无法恢复，确定要删除这张图片吗？</p>
                    <div className="confirm-btns">
                      <motion.button
                        type="button"
                        onClick={handleDeleteCancel}
                        className="confirm-btn confirm-btn-cancel"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        取消
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleDeleteConfirm}
                        className="confirm-btn"
                        style={{ background: '#dc2626', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? '删除中...' : '确认删除'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
