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
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-white/95 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 内容区域 */}
          <motion.div
            className="relative z-10 max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* 顶部工具栏 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 text-lg font-medium">图片预览</h3>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="下载图片"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="删除图片"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* 图片容器 */}
            <motion.div
              className="flex-1 overflow-auto rounded-2xl bg-gray-50 p-4 border border-gray-200"
              layoutId={`image-${imageId}`}
            >
              <motion.img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-full mx-auto rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}