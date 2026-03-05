import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ImageRecord } from '../types';

/**
 * 将图片记录打包为 ZIP 并下载
 */
export async function exportImagesAsZip(images: ImageRecord[], filename?: string): Promise<void> {
  const zip = new JSZip();
  const folderName = filename || `LucidMark_Archive_${new Date().toISOString().split('T')[0]}`;
  const folder = zip.folder(folderName);

  if (!folder) {
    throw new Error('Failed to create ZIP folder');
  }

  // 添加所有图片到 ZIP
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const timestamp = new Date(image.createdAt).toISOString().replace(/[:.]/g, '-');
    const textSnippet = image.originalText.substring(0, 10).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '_');
    const filename = `${i + 1}_${timestamp}_${textSnippet}.png`;

    folder.file(filename, image.imageBlob);
  }

  // 生成 ZIP 文件
  const content = await zip.generateAsync({ type: 'blob' });

  // 触发下载
  saveAs(content, `${folderName}.zip`);
}