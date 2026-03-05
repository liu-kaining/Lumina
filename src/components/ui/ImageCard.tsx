import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, GripVertical, Maximize2, Check, Trash2 } from 'lucide-react';
import { ImageRecord } from '../../types';
import { cn } from '../../lib/utils';

interface ImageCardProps {
  image: ImageRecord;
  isSelected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

/**
 * 图片卡片组件
 * 支持拖拽、下载、多选、删除、点击放大
 */
export function ImageCard({
  image,
  isSelected = false,
  selectionMode = false,
  onToggleSelect,
  onClick,
  onDelete,
  className
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const imageUrl = URL.createObjectURL(image.imageBlob);

  const handleDragStart = (e: React.DragEvent) => {
    if (selectionMode) return;
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
    e.stopPropagation();
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `lucidmark_${image.createdAt}.png`;
    a.click();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectionMode) {
      onToggleSelect?.();
    } else {
      onClick?.();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.();
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.();
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-white border shadow-sm',
        'transition-all duration-300',
        isSelected
           ? 'border-amber-400 ring-2 ring-amber-400/30'
           : 'border-gray-200 hover:border-amber-300 hover:shadow-md',
        isDragging && 'opacity-50 scale-95',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 图片区域 - 可点击放大/选择 */}
      <div
        className="relative cursor-pointer"
        onClick={handleCardClick}
      >
        {/* 选中指示器 */}
        {selectionMode && (
          <motion.div
            className={cn(
              'absolute top-3 left-3 z-30 w-8 h-8 rounded-full',
              'border-2 flex items-center justify-center',
              'transition-all duration-200 cursor-pointer',
              isSelected
                 ? 'bg-amber-500 border-amber-500'
                 : 'bg-white/90 border-gray-300'
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 图片 - 显示原图比例 */}
        <img
          src={imageUrl}
          alt={image.originalText}
          className={cn(
            'w-full h-auto object-contain transition-all duration-200',
            isSelected && selectionMode && 'opacity-80'
          )}
          draggable={false}
        />

        {/* 悬浮操作栏 - 非选择模式 */}
        {!selectionMode && isHovered && (
          <motion.div
            className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="p-2.5 rounded-lg bg-white/90 hover:bg-white transition-colors shadow-sm"
                title="下载"
              >
                <Download className="w-4 h-4 text-gray-700" />
              </button>

              <button
                onClick={handleDelete}
                className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
                title="删除"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="flex gap-2">
              <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="p-2.5 rounded-lg bg-white/90 hover:bg-white transition-colors shadow-sm cursor-grab active:cursor-grabbing"
                title="拖拽到编辑器"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-gray-700" />
              </div>

              <button
                onClick={handlePreview}
                className="p-2.5 rounded-lg bg-white/90 hover:bg-white transition-colors shadow-sm"
                title="放大预览"
              >
                <Maximize2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 原文提示 */}
      <div className="p-3 cursor-pointer bg-gray-50" onClick={handleCardClick}>
        <p className="text-gray-700 text-sm line-clamp-2">
          {image.originalText}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {new Date(image.createdAt).toLocaleString('zh-CN')}
        </p>
      </div>
    </motion.div>
  );
}