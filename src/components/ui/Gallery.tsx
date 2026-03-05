import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckSquare, Square, Trash2, X, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/db';
import { ImageRecord } from '../../types';
import { ImageCard } from './ImageCard';
import { ImagePreview } from './ImagePreview';
import { exportImagesAsZip } from '../../utils/export';

export function Gallery() {
  const images = useLiveQuery(() =>
    db.images.orderBy('createdAt').reverse().toArray()
  );

  const [isExporting, setIsExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ id: number; url: string } | null>(null);

  // 多选状态
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleImageClick = (image: ImageRecord) => {
    if (selectionMode) {
      toggleSelect(image.id!);
    } else {
      const url = URL.createObjectURL(image.imageBlob);
      setPreviewImage({ id: image.id!, url });
      setPreviewOpen(true);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (images) {
      setSelectedIds(new Set(images.map((img) => img.id!)));
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    try {
      for (const id of selectedIds) {
        await db.images.delete(id);
      }
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleDeleteSingle = async (id: number) => {
    try {
      await db.images.delete(id);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleExportSelected = async () => {
    if (!images) return;

    const toExport = selectionMode && selectedIds.size > 0
      ? images.filter((img) => selectedIds.has(img.id!))
      : images;

    if (toExport.length === 0) return;

    setIsExporting(true);
    try {
      await exportImagesAsZip(toExport as ImageRecord[]);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    if (!images || images.length === 0) return;

    setIsExporting(true);
    try {
      await exportImagesAsZip(images as ImageRecord[]);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewImage?.url) {
      URL.revokeObjectURL(previewImage.url);
    }
    setPreviewImage(null);
  };

  // 清理 URL
  useEffect(() => {
    return () => {
      if (previewImage?.url) {
        URL.revokeObjectURL(previewImage.url);
      }
    };
  }, []);

  // 退出选择模式时清空选择
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  if (!images || images.length === 0) {
    return null;
  }

  const selectedCount = selectedIds.size;
  const allSelected = images.length === selectedIds.size;

  return (
    <div className="gallery-wrap">
      <div className="gallery-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="gallery-title">光影画廊 ({images.length})</h3>
          {selectionMode ? (
            <motion.button
              type="button"
              onClick={exitSelectionMode}
              className="gallery-btn gallery-btn-amber"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X />
              完成选择
            </motion.button>
          ) : (
            <div className="gallery-actions">
              <motion.button
                type="button"
                onClick={() => setSelectionMode(true)}
                className="gallery-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Square />
                选择
              </motion.button>
              <motion.button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="gallery-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Package />
                {isExporting ? '打包中...' : '打包下载'}
              </motion.button>
            </div>
          )}
        </div>

        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="gallery-btn-row2"
          >
            <motion.button
              type="button"
              onClick={allSelected ? deselectAll : selectAll}
              className="gallery-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {allSelected ? (
                <>
                  <Square />
                  取消全选
                </>
              ) : (
                <>
                  <CheckSquare />
                  全选
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleExportSelected}
              disabled={selectedCount === 0 || isExporting}
              className="gallery-btn gallery-btn-amber"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download />
              {isExporting ? '打包中...' : `下载 (${selectedCount})`}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0}
              className="gallery-btn gallery-btn-red"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 />
              删除 ({selectedCount})
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectionMode && selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="gallery-hint"
          >
            <p>已选择 {selectedCount} 张图片</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="gallery-list">
        <AnimatePresence>
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image as ImageRecord}
              isSelected={selectedIds.has(image.id!)}
              selectionMode={selectionMode}
              onToggleSelect={() => toggleSelect(image.id!)}
              onClick={() => handleImageClick(image as ImageRecord)}
              onDelete={() => handleDeleteSingle(image.id!)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 图片预览模态框 */}
      <ImagePreview
        isOpen={previewOpen}
        imageId={previewImage?.id ?? null}
        imageUrl={previewImage?.url ?? null}
        onClose={handleClosePreview}
        onDelete={() => {
          // 刷新列表会自动更新
        }}
      />
    </div>
  );
}