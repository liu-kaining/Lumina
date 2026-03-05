import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckSquare, Square, Trash2, X, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/db';
import { ImageRecord } from '../../types';
import { ImageCard } from './ImageCard';
import { ImagePreview } from './ImagePreview';
import { exportImagesAsZip } from '../../utils/export';
import { cn } from '../../lib/utils';

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
    <div className="mt-6">
      {/* 顶部工具栏 - 响应式布局 */}
      <div className="space-y-3 mb-4">
        {/* 第一行：标题和主要操作 */}
        <div className="flex items-center justify-between">
          <h3 className="text-gray-700 text-sm font-medium">
            光影画廊 ({images.length})
          </h3>

          {/* 选择模式按钮 / 打包下载 */}
          {selectionMode ? (
            <motion.button
              onClick={exitSelectionMode}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
                'bg-amber-100 text-amber-700 border border-amber-200',
                'transition-all duration-200'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-3.5 h-3.5" />
              完成选择
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setSelectionMode(true)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
                  'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
                  'transition-all duration-200 shadow-sm'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Square className="w-3.5 h-3.5" />
                选择
              </motion.button>

              <motion.button
                onClick={handleExport}
                disabled={isExporting}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
                  'bg-white hover:bg-gray-50',
                  'border border-gray-200 text-gray-600 shadow-sm',
                  'transition-colors disabled:opacity-50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Package className="w-3.5 h-3.5" />
                {isExporting ? '打包中...' : '打包下载'}
              </motion.button>
            </div>
          )}
        </div>

        {/* 第二行：选择模式操作按钮 */}
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 flex-wrap"
          >
            {/* 全选/取消全选 */}
            <motion.button
              onClick={allSelected ? deselectAll : selectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition-colors shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {allSelected ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  取消全选
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  全选
                </>
              )}
            </motion.button>

            {/* 批量下载 */}
            <motion.button
               onClick={handleExportSelected}
               disabled={selectedCount === 0 || isExporting}
               className={cn(
                 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
                 'bg-amber-50 hover:bg-amber-100 text-amber-700',
                 'border border-amber-200 transition-colors',
                 'disabled:opacity-50 disabled:cursor-not-allowed'
               )}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
             >
               <Download className="w-3.5 h-3.5" />
               {isExporting ? '打包中...' : `下载 (${selectedCount})`}
             </motion.button>

            {/* 批量删除 */}
            <motion.button
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
                'bg-red-50 hover:bg-red-100 text-red-600',
                'border border-red-200 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除 ({selectedCount})
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* 选择提示条 */}
      <AnimatePresence>
        {selectionMode && selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
          >
            <p className="text-amber-700 text-xs">
              已选择 {selectedCount} 张图片
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 单列画廊 - 适配窄屏 */}
      <div className="flex flex-col gap-4">
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