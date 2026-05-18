import { RedemptionCodeStatus } from './redemption-code';

/**
 * 备份用的类别数据（不含 id）
 */
export interface BackupCategory {
  uuid: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * 备份用的兑换码数据（不含 id，使用 categoryUuid）
 */
export interface BackupCode {
  uuid: string;
  code: string;
  categoryUuid: string | null;
  description: string | null;
  expireDate: number | null;
  status: RedemptionCodeStatus;
  notifyDays: number | null;
  isNotifyEnabled: boolean;
  createdAt: number;
  updatedAt: number;
  usedAt: number | null;
}

/**
 * 备份数据结构
 */
export interface BackupData {
  categories: BackupCategory[];
  codes: BackupCode[];
}

/**
 * 完整备份文件结构
 */
export interface BackupFile {
  version: number;
  databaseVersion: number;
  exportedAt: number;
  appVersion: string;
  data: BackupData;
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  categoriesImported: number;
  categoriesSkipped: number;
  codesImported: number;
  codesSkipped: number;
  error?: string;
}
