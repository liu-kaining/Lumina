import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2 } from 'lucide-react';
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

  const handleDelete = async () => {
    if (!imageId || isDeleting) return;
    setIsDeleting(true);
    try {
      await dbOperations.deleteImage(imageId);
      onDelete?.();
      onClose();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setIsDeleting(false);
    }
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
                onClick={handleDelete}
                className="preview-btn preview-btn-delete"
                disabled={isDeleting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="删除图片"
              >
                <Trash2 />
                {isDeleting ? '删除中...' : '删除'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
