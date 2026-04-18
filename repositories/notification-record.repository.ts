import {
  NotificationRecord,
  NotificationRecordWithCode,
  NotificationStatus,
  NotificationRecordRow,
} from '@/types';
import { getDatabase } from '@/services/database.service';
import { getTodayStartTimestamp } from '@/utils/date';

/**
 * 将数据库行转换为实体
 */
function rowToEntity(row: NotificationRecordRow): NotificationRecord {
  return {
    id: row.id,
    redemptionCodeId: row.redemption_code_id,
    notifiedAt: row.notified_at,
    content: row.content,
    status: row.status as NotificationStatus,
    clickedAt: row.clicked_at,
  };
}

/**
 * 通知记录数据访问层
 */
export const NotificationRecordRepository = {
  /**
   * 创建通知记录
   */
  async create(data: {
    redemptionCodeId: number;
    content: string;
  }): Promise<NotificationRecord | null> {
    const db = getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO notification_record
       (redemption_code_id, notified_at, content, status, clicked_at)
       VALUES (?, ?, ?, ?, ?)`,
      [data.redemptionCodeId, now, data.content, NotificationStatus.SENT, null]
    );
    return this.getById(result.lastInsertRowId);
  },

  /**
   * 根据ID获取通知记录
   */
  async getById(id: number): Promise<NotificationRecord | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<NotificationRecordRow>(
      'SELECT * FROM notification_record WHERE id = ?',
      [id]
    );
    return row ? rowToEntity(row) : null;
  },

  /**
   * 获取某兑换码的通知记录
   */
  async getByCodeId(codeId: number): Promise<NotificationRecord[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<NotificationRecordRow>(
      'SELECT * FROM notification_record WHERE redemption_code_id = ? ORDER BY notified_at DESC',
      [codeId]
    );
    return rows.map(rowToEntity);
  },

  /**
   * 获取今日已通知的兑换码ID列表
   */
  async getTodayNotifiedCodeIds(): Promise<number[]> {
    const db = getDatabase();
    const todayStart = getTodayStartTimestamp();
    const rows = await db.getAllAsync<{ redemption_code_id: number }>(
      'SELECT DISTINCT redemption_code_id FROM notification_record WHERE notified_at >= ?',
      [todayStart]
    );
    return rows.map((row) => row.redemption_code_id);
  },

  /**
   * 获取所有通知记录（含兑换码信息）
   */
  async getAllWithCode(): Promise<NotificationRecordWithCode[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<
      NotificationRecordRow & { code: string; code_id: number }
    >(
      `SELECT nr.*, rc.code, rc.id as code_id
       FROM notification_record nr
       INNER JOIN redemption_code rc ON nr.redemption_code_id = rc.id
       ORDER BY nr.notified_at DESC`
    );
    return rows.map((row) => ({
      ...rowToEntity(row),
      code: row.code,
      codeId: row.code_id,
    }));
  },

  /**
   * 获取所有通知记录
   */
  async getAll(): Promise<NotificationRecord[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<NotificationRecordRow>(
      'SELECT * FROM notification_record ORDER BY notified_at DESC'
    );
    return rows.map(rowToEntity);
  },

  /**
   * 更新点击状态
   */
  async updateClicked(id: number): Promise<boolean> {
    const db = getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      'UPDATE notification_record SET status = ?, clicked_at = ? WHERE id = ?',
      [NotificationStatus.CLICKED, now, id]
    );
    return result.changes > 0;
  },

  /**
   * 更新已读状态
   */
  async updateRead(id: number): Promise<boolean> {
    const db = getDatabase();
    const result = await db.runAsync(
      'UPDATE notification_record SET status = ? WHERE id = ?',
      [NotificationStatus.READ, id]
    );
    return result.changes > 0;
  },

  /**
   * 清除所有记录
   */
  async clearAll(): Promise<number> {
    const db = getDatabase();
    const result = await db.runAsync('DELETE FROM notification_record');
    return result.changes;
  },

  /**
   * 获取通知记录总数
   */
  async getCount(): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM notification_record'
    );
    return result?.count ?? 0;
  },
};
