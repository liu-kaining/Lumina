import Dexie, { Table } from 'dexie';
import { ImageRecord } from '@/types';

/**
 * LucidMark 数据库类
 * 使用 IndexedDB 存储生成的图片记录
 */
export class LucidMarkDatabase extends Dexie {
  images!: Table<ImageRecord, number>;

  constructor() {
    super('LucidMarkDB');

    this.version(1).stores({
      images: '++id, originalText, refinedPrompt, stylePreset, providerId, createdAt',
    });
  }
}

// 导出数据库实例
export const db = new LucidMarkDatabase();

/**
 * 数据库操作辅助函数
 */
export const dbOperations = {
  /**
   * 添加图片记录
   */
  async addImage(record: Omit<ImageRecord, 'id'>): Promise<number> {
    const id = await db.images.add(record as ImageRecord);
    return id as number;
  },

  /**
   * 获取所有图片记录
   */
  async getAllImages(): Promise<ImageRecord[]> {
    return await db.images.orderBy('createdAt').reverse().toArray();
  },

  /**
   * 根据 ID 获取图片
   */
  async getImageById(id: number): Promise<ImageRecord | undefined> {
    return await db.images.get(id);
  },

  /**
   * 删除图片
   */
  async deleteImage(id: number): Promise<void> {
    await db.images.delete(id);
  },

  /**
   * 清空所有图片
   */
  async clearAllImages(): Promise<void> {
    await db.images.clear();
  },

  /**
   * 获取图片总数
   */
  async getImageCount(): Promise<number> {
    return await db.images.count();
  },
};