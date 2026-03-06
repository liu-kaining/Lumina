import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, GripVertical, Maximize2, Check, Trash2 } from 'lucide-react';
import { ImageRecord } from '../../types';

interface ImageCardProps {
  image: ImageRecord;
  isSelected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ImageCard({
  image,
  isSelected = false,
  selectionMode = false,
  onToggleSelect,
  onClick,
  onDelete,
  className,
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
      className={`gallery-card ${isSelected ? 'selected' : ''} ${className ?? ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(0.98)' : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="gallery-card-img-wrap"
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={handleCardClick}
      >
        {selectionMode && (
          <motion.div
            className={`gallery-card-check ${isSelected ? 'selected' : ''}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
          >
            {isSelected && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check />
              </motion.div>
            )}
          </motion.div>
        )}

        <img
          src={imageUrl}
          alt={image.originalText}
          className="gallery-card-img"
          style={{ opacity: isSelected && selectionMode ? 0.8 : 1 }}
          draggable={false}
        />

        {!selectionMode && isHovered && (
          <motion.div
            className="gallery-card-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="gallery-card-actions">
              <button
                type="button"
                onClick={handleDownload}
                className="gallery-card-action"
                title="下载"
              >
                <Download />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="gallery-card-footer" onClick={handleCardClick}>
        <p>{image.originalText}</p>
        <p className="muted">{new Date(image.createdAt).toLocaleString('zh-CN')}</p>
      </div>
    </motion.div>
  );
}
