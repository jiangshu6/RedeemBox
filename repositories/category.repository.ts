import { Category, CategoryWithCount, CreateCategoryDTO, UpdateCategoryDTO, CategoryRow, BackupCategory } from '@/types';
import { getDatabase, generateUuid } from '@/services/database.service';
import { DEFAULT_CATEGORY_COLOR } from '@/constants';

/**
 * 将数据库行转换为实体
 */
function rowToEntity(row: CategoryRow): Category {
  return {
    id: row.id,
    uuid: row.uuid ?? '',
    name: row.name,
    color: row.color,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 类别数据访问层
 */
export const CategoryRepository = {
  /**
   * 创建类别
   */
  async create(data: CreateCategoryDTO): Promise<Category | null> {
    const db = getDatabase();
    const now = Date.now();
    const uuid = generateUuid();

    // 获取当前最大排序值
    const maxSortResult = await db.getFirstAsync<{ max_sort: number | null }>(
      'SELECT MAX(sort_order) as max_sort FROM category'
    );
    const sortOrder = (maxSortResult?.max_sort ?? -1) + 1;

    const result = await db.runAsync(
      `INSERT INTO category (uuid, name, color, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuid, data.name, data.color ?? DEFAULT_CATEGORY_COLOR, sortOrder, now, now]
    );
    return this.getById(result.lastInsertRowId);
  },

  /**
   * 更新类别
   */
  async update(id: number, data: UpdateCategoryDTO): Promise<Category | null> {
    const db = getDatabase();
    const now = Date.now();
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE category SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(id);
  },

  /**
   * 删除类别
   */
  async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    // 先将关联的兑换码的 category_id 置为 null
    await db.runAsync(
      'UPDATE redemption_code SET category_id = NULL WHERE category_id = ?',
      [id]
    );
    // 然后删除类别
    const result = await db.runAsync(
      'DELETE FROM category WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  },

  /**
   * 根据ID获取类别
   */
  async getById(id: number): Promise<Category | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<CategoryRow>(
      'SELECT * FROM category WHERE id = ?',
      [id]
    );
    return row ? rowToEntity(row) : null;
  },

  /**
   * 获取所有类别
   */
  async getAll(): Promise<Category[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<CategoryRow>(
      'SELECT * FROM category ORDER BY sort_order ASC'
    );
    return rows.map(rowToEntity);
  },

  /**
   * 获取所有类别（含兑换码数量）
   */
  async getAllWithCount(): Promise<CategoryWithCount[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<CategoryRow & { code_count: number }>(
      `SELECT c.*, COUNT(rc.id) as code_count
       FROM category c
       LEFT JOIN redemption_code rc ON c.id = rc.category_id
       GROUP BY c.id
       ORDER BY c.sort_order ASC`
    );
    return rows.map((row) => ({
      ...rowToEntity(row),
      codeCount: row.code_count,
    }));
  },

  /**
   * 更新排序
   */
  async updateSortOrder(ids: number[]): Promise<void> {
    const db = getDatabase();
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < ids.length; i++) {
        await db.runAsync(
          'UPDATE category SET sort_order = ? WHERE id = ?',
          [i, ids[i]]
        );
      }
    });
  },

  /**
   * 检查名称是否存在
   */
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const db = getDatabase();
    let sql = 'SELECT COUNT(*) as count FROM category WHERE name = ?';
    const params: (string | number)[] = [name];

    if (excludeId !== undefined) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await db.getFirstAsync<{ count: number }>(sql, params);
    return (result?.count ?? 0) > 0;
  },

  /**
   * 获取类别总数
   */
  async getCount(): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM category'
    );
    return result?.count ?? 0;
  },

  /**
   * 根据 UUID 获取类别
   */
  async getByUuid(uuid: string): Promise<Category | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<CategoryRow>(
      'SELECT * FROM category WHERE uuid = ?',
      [uuid]
    );
    return row ? rowToEntity(row) : null;
  },

  /**
   * 获取所有 UUID 集合
   */
  async getAllUuids(): Promise<Set<string>> {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ uuid: string }>(
      'SELECT uuid FROM category WHERE uuid IS NOT NULL'
    );
    return new Set(rows.map((row) => row.uuid));
  },

  /**
   * 从备份数据导入类别
   * @returns 导入的类别 ID，如果已存在则返回 null
   */
  async importFromBackup(data: BackupCategory): Promise<Category | null> {
    const db = getDatabase();

    // 检查 UUID 是否已存在
    const existing = await this.getByUuid(data.uuid);
    if (existing) {
      return null;
    }

    const result = await db.runAsync(
      `INSERT INTO category (uuid, name, color, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.uuid, data.name, data.color, data.sortOrder, data.createdAt, data.updatedAt]
    );
    return this.getById(result.lastInsertRowId);
  },
};
