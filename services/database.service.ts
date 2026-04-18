import * as SQLite from 'expo-sqlite';
import { PRESET_COLORS } from '@/constants';

/**
 * 数据库名称
 */
const DATABASE_NAME = 'redemption_codes.db';

/**
 * 数据库版本
 */
const DATABASE_VERSION = 1;

/**
 * 数据库实例
 */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * 初始化数据库
 * @returns 数据库实例
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await runMigrations(db);

  return db;
}

/**
 * 获取数据库实例
 * @returns 数据库实例
 * @throws 如果数据库未初始化
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/**
 * 运行数据库迁移
 * @param database 数据库实例
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const result = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await runMigrationV1(database);
  }

  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

/**
 * V1 迁移：创建初始表结构
 * @param database 数据库实例
 */
async function runMigrationV1(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    -- 创建兑换码表
    CREATE TABLE IF NOT EXISTS redemption_code (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      category_id INTEGER,
      description TEXT,
      expire_date INTEGER,
      status INTEGER NOT NULL DEFAULT 0,
      notify_days INTEGER,
      is_notify_enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      used_at INTEGER,
      FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
    );

    -- 创建类别表
    CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#2196F3',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 创建通知记录表
    CREATE TABLE IF NOT EXISTS notification_record (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      redemption_code_id INTEGER NOT NULL,
      notified_at INTEGER NOT NULL,
      content TEXT NOT NULL,
      status INTEGER NOT NULL DEFAULT 0,
      clicked_at INTEGER,
      FOREIGN KEY (redemption_code_id) REFERENCES redemption_code(id) ON DELETE CASCADE
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_rc_category ON redemption_code(category_id);
    CREATE INDEX IF NOT EXISTS idx_rc_status ON redemption_code(status);
    CREATE INDEX IF NOT EXISTS idx_rc_expire ON redemption_code(expire_date);
    CREATE INDEX IF NOT EXISTS idx_nr_code ON notification_record(redemption_code_id);
  `);

  await insertInitialData(database);
}

/**
 * 插入初始数据
 * @param database 数据库实例
 */
async function insertInitialData(database: SQLite.SQLiteDatabase): Promise<void> {
  const now = Date.now();
  const defaultCategories = [
    { name: '游戏', color: PRESET_COLORS[0], sortOrder: 0 },
    { name: '应用', color: PRESET_COLORS[1], sortOrder: 1 },
    { name: '会员', color: PRESET_COLORS[2], sortOrder: 2 },
    { name: '礼品卡', color: PRESET_COLORS[3], sortOrder: 3 },
  ];

  for (const category of defaultCategories) {
    await database.runAsync(
      `INSERT OR IGNORE INTO category (name, color, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [category.name, category.color, category.sortOrder, now, now]
    );
  }
}

/**
 * 检查数据库是否已初始化
 * @returns 是否已初始化
 */
export function isDatabaseInitialized(): boolean {
  return db !== null;
}
