import {
  RedemptionCode,
  CreateCodeDTO,
  UpdateCodeDTO,
  CodeFilter,
  SortOption,
  RedemptionCodeStatus,
  RedemptionCodeRow,
} from '@/types';
import { getDatabase } from '@/services/database.service';
import { getTodayEndTimestamp, getTodayStartTimestamp } from '@/utils/date';

/**
 * 将数据库行转换为实体
 */
function rowToEntity(row: RedemptionCodeRow): RedemptionCode {
  return {
    id: row.id,
    code: row.code,
    categoryId: row.category_id,
    description: row.description,
    expireDate: row.expire_date,
    status: row.status as RedemptionCodeStatus,
    notifyDays: row.notify_days,
    isNotifyEnabled: row.is_notify_enabled === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    usedAt: row.used_at,
  };
}

/**
 * 兑换码数据访问层
 */
export const CodeRepository = {
  /**
   * 创建兑换码
   */
  async create(data: CreateCodeDTO): Promise<RedemptionCode | null> {
    const db = getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO redemption_code
       (code, category_id, description, expire_date, status, notify_days, is_notify_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.categoryId ?? null,
        data.description ?? null,
        data.expireDate ?? null,
        RedemptionCodeStatus.ACTIVE,
        data.notifyDays ?? null,
        data.isNotifyEnabled !== false ? 1 : 0,
        now,
        now,
      ]
    );
    return this.getById(result.lastInsertRowId);
  },

  /**
   * 更新兑换码
   */
  async update(id: number, data: UpdateCodeDTO): Promise<RedemptionCode | null> {
    const db = getDatabase();
    const now = Date.now();
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.code !== undefined) {
      updates.push('code = ?');
      values.push(data.code);
    }
    if (data.categoryId !== undefined) {
      updates.push('category_id = ?');
      values.push(data.categoryId);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.expireDate !== undefined) {
      updates.push('expire_date = ?');
      values.push(data.expireDate);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.notifyDays !== undefined) {
      updates.push('notify_days = ?');
      values.push(data.notifyDays);
    }
    if (data.isNotifyEnabled !== undefined) {
      updates.push('is_notify_enabled = ?');
      values.push(data.isNotifyEnabled ? 1 : 0);
    }
    if (data.usedAt !== undefined) {
      updates.push('used_at = ?');
      values.push(data.usedAt);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE redemption_code SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(id);
  },

  /**
   * 删除兑换码
   */
  async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const result = await db.runAsync(
      'DELETE FROM redemption_code WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  },

  /**
   * 根据ID获取兑换码
   */
  async getById(id: number): Promise<RedemptionCode | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<RedemptionCodeRow>(
      'SELECT * FROM redemption_code WHERE id = ?',
      [id]
    );
    return row ? rowToEntity(row) : null;
  },

  /**
   * 获取所有兑换码
   */
  async getAll(filter?: CodeFilter, sort?: SortOption): Promise<RedemptionCode[]> {
    const db = getDatabase();
    let sql = 'SELECT * FROM redemption_code WHERE 1=1';
    const params: (string | number | null)[] = [];

    if (filter) {
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        sql += ` AND category_id IN (${filter.categoryIds.map(() => '?').join(',')})`;
        params.push(...filter.categoryIds);
      }
      if (filter.status !== null && filter.status !== undefined) {
        sql += ' AND status = ?';
        params.push(filter.status);
      }
      if (filter.expireRange === 'expiring') {
        const today = getTodayEndTimestamp();
        sql += ' AND expire_date IS NOT NULL AND expire_date > ? AND status = ?';
        params.push(today, RedemptionCodeStatus.ACTIVE);
      }
      if (filter.expireRange === 'thisMonth') {
        const todayStart = getTodayStartTimestamp();
        const monthEnd = new Date();
        monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        sql += ' AND expire_date IS NOT NULL AND expire_date >= ? AND expire_date <= ?';
        params.push(todayStart, monthEnd.getTime());
      }
    }

    const sortField = sort?.field ?? 'created_at';
    const sortOrder = sort?.order ?? 'DESC';
    sql += ` ORDER BY ${sortField} ${sortOrder}`;

    const rows = await db.getAllAsync<RedemptionCodeRow>(sql, params);
    return rows.map(rowToEntity);
  },

  /**
   * 搜索兑换码
   */
  async search(keyword: string): Promise<RedemptionCode[]> {
    const db = getDatabase();
    const searchTerm = `%${keyword}%`;
    const rows = await db.getAllAsync<RedemptionCodeRow>(
      `SELECT * FROM redemption_code
       WHERE code LIKE ? OR description LIKE ?
       ORDER BY created_at DESC`,
      [searchTerm, searchTerm]
    );
    return rows.map(rowToEntity);
  },

  /**
   * 获取即将到期的兑换码
   */
  async getExpiringCodes(days: number): Promise<RedemptionCode[]> {
    const db = getDatabase();
    const todayEnd = getTodayEndTimestamp();
    const futureDate = todayEnd + days * 24 * 60 * 60 * 1000;

    const rows = await db.getAllAsync<RedemptionCodeRow>(
      `SELECT * FROM redemption_code
       WHERE expire_date IS NOT NULL
         AND expire_date > ?
         AND expire_date <= ?
         AND status = ?
         AND is_notify_enabled = 1
       ORDER BY expire_date ASC`,
      [todayEnd, futureDate, RedemptionCodeStatus.ACTIVE]
    );
    return rows.map(rowToEntity);
  },

  /**
   * 批量更新过期状态
   */
  async updateExpiredStatus(): Promise<number> {
    const db = getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      `UPDATE redemption_code
       SET status = ?, updated_at = ?
       WHERE expire_date IS NOT NULL
         AND expire_date < ?
         AND status = ?`,
      [RedemptionCodeStatus.EXPIRED, now, now, RedemptionCodeStatus.ACTIVE]
    );
    return result.changes;
  },

  /**
   * 标记为已使用
   */
  async markAsUsed(id: number): Promise<RedemptionCode | null> {
    const now = Date.now();
    return this.update(id, {
      status: RedemptionCodeStatus.USED,
      usedAt: now,
    });
  },

  /**
   * 获取兑换码总数
   */
  async getCount(): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM redemption_code'
    );
    return result?.count ?? 0;
  },

  /**
   * 根据类别ID获取兑换码数量
   */
  async getCountByCategoryId(categoryId: number | null): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM redemption_code WHERE category_id = ?',
      [categoryId]
    );
    return result?.count ?? 0;
  },

  /**
   * 批量删除兑换码
   */
  async deleteMany(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.runAsync(
      `DELETE FROM redemption_code WHERE id IN (${placeholders})`,
      ids
    );
    return result.changes;
  },
};
