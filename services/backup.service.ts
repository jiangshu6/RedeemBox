import { StorageAccessFramework, readAsStringAsync } from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import {
  BackupFile,
  BackupData,
  BackupCategory,
  BackupCode,
  ImportResult,
  Category,
  RedemptionCode,
} from '@/types';
import { CategoryRepository } from '@/repositories/category.repository';
import { CodeRepository } from '@/repositories/code.repository';
import { getDatabase } from '@/services/database.service';

/**
 * 应用版本号
 */
const APP_VERSION = '1.0.0';

/**
 * 备份文件版本
 */
const BACKUP_VERSION = 1;

/**
 * 当前数据库版本
 */
const CURRENT_DATABASE_VERSION = 2;

/**
 * 导出备份
 * @returns 是否成功
 */
export async function exportBackup(): Promise<boolean> {
  try {
    // 1. 获取所有数据
    const categories = await CategoryRepository.getAll();
    const codes = await CodeRepository.getAll();

    // 2. 转换为备份格式
    const backupCategories: BackupCategory[] = categories.map((cat) => ({
      uuid: cat.uuid,
      name: cat.name,
      color: cat.color,
      sortOrder: cat.sortOrder,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    // 构建 uuid -> id 的映射
    const categoryUuidToId = new Map<string, number>();
    categories.forEach((cat) => {
      categoryUuidToId.set(cat.uuid, cat.id);
    });

    // 构建 id -> uuid 的映射
    const categoryIdToUuid = new Map<number | null, string | null>();
    categories.forEach((cat) => {
      categoryIdToUuid.set(cat.id, cat.uuid);
    });

    const backupCodes: BackupCode[] = codes.map((code) => ({
      uuid: code.uuid,
      code: code.code,
      categoryUuid: code.categoryId ? (categoryIdToUuid.get(code.categoryId) ?? null) : null,
      description: code.description,
      expireDate: code.expireDate,
      status: code.status,
      notifyDays: code.notifyDays,
      isNotifyEnabled: code.isNotifyEnabled,
      createdAt: code.createdAt,
      updatedAt: code.updatedAt,
      usedAt: code.usedAt,
    }));

    // 3. 获取数据库版本
    const db = getDatabase();
    const versionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const databaseVersion = versionResult?.user_version ?? 0;

    // 4. 组装备份文件
    const backupFile: BackupFile = {
      version: BACKUP_VERSION,
      databaseVersion,
      exportedAt: Date.now(),
      appVersion: APP_VERSION,
      data: {
        categories: backupCategories,
        codes: backupCodes,
      },
    };

    // 5. 转换为 JSON
    const jsonContent = JSON.stringify(backupFile, null, 2);

    // 6. 使用 StorageAccessFramework 让用户选择保存位置
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      return false;
    }

    // 7. 创建文件
    const fileName = `redeembox_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const fileUri = await StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      fileName,
      'application/json'
    );

    // 8. 写入内容
    await StorageAccessFramework.writeAsStringAsync(fileUri, jsonContent);

    return true;
  } catch (error) {
    console.error('Export backup failed:', error);
    return false;
  }
}

/**
 * 导入备份
 * @returns 导入结果
 */
export async function importBackup(): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    categoriesImported: 0,
    categoriesSkipped: 0,
    codesImported: 0,
    codesSkipped: 0,
  };

  try {
    // 1. 选择文件
    const pickerResult = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (pickerResult.canceled) {
      result.error = '用户取消选择';
      return result;
    }

    const fileUri = pickerResult.assets[0].uri;

    // 2. 读取文件内容
    const jsonContent = await readAsStringAsync(fileUri);

    // 3. 解析 JSON
    let backupData: unknown;
    try {
      backupData = JSON.parse(jsonContent);
    } catch {
      result.error = '无效的备份文件';
      return result;
    }

    // 4. 验证备份文件格式
    const backupFile = validateBackupFile(backupData);
    if (!backupFile) {
      result.error = '备份文件格式错误';
      return result;
    }

    // 5. 导入类别
    const categoryUuidToId = new Map<string, number>();
    for (const categoryData of backupFile.data.categories) {
      const imported = await CategoryRepository.importFromBackup(categoryData);
      if (imported) {
        categoryUuidToId.set(categoryData.uuid, imported.id);
        result.categoriesImported++;
      } else {
        // 如果导入失败，可能是已存在，尝试获取现有记录
        const existing = await CategoryRepository.getByUuid(categoryData.uuid);
        if (existing) {
          categoryUuidToId.set(categoryData.uuid, existing.id);
        }
        result.categoriesSkipped++;
      }
    }

    // 6. 导入兑换码
    for (const codeData of backupFile.data.codes) {
      // 查找对应的类别 ID
      let categoryId: number | null = null;
      if (codeData.categoryUuid) {
        categoryId = categoryUuidToId.get(codeData.categoryUuid) ?? null;
      }

      const imported = await CodeRepository.importFromBackup(codeData, categoryId);
      if (imported) {
        result.codesImported++;
      } else {
        result.codesSkipped++;
      }
    }

    result.success = true;
    return result;
  } catch (error) {
    console.error('Import backup failed:', error);
    result.error = '导入失败';
    return result;
  }
}

/**
 * 验证备份文件格式
 * @param data 待验证的数据
 * @returns 验证通过的备份文件，或 null
 */
export function validateBackupFile(data: unknown): BackupFile | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const file = data as Record<string, unknown>;

  // 检查版本
  if (typeof file.version !== 'number' || file.version !== BACKUP_VERSION) {
    return null;
  }

  // 检查数据库版本
  if (typeof file.databaseVersion !== 'number') {
    return null;
  }

  // 如果备份数据库版本高于当前版本，不兼容
  if (file.databaseVersion > CURRENT_DATABASE_VERSION) {
    return null;
  }

  // 检查导出时间
  if (typeof file.exportedAt !== 'number') {
    return null;
  }

  // 检查应用版本
  if (typeof file.appVersion !== 'string') {
    return null;
  }

  // 检查数据
  if (!file.data || typeof file.data !== 'object') {
    return null;
  }

  const backupData = file.data as Record<string, unknown>;

  // 检查类别数组
  if (!Array.isArray(backupData.categories)) {
    return null;
  }

  // 检查兑换码数组
  if (!Array.isArray(backupData.codes)) {
    return null;
  }

  // 验证类别数据
  for (const cat of backupData.categories) {
    if (!validateBackupCategory(cat)) {
      return null;
    }
  }

  // 验证兑换码数据
  for (const code of backupData.codes) {
    if (!validateBackupCode(code)) {
      return null;
    }
  }

  return file as unknown as BackupFile;
}

/**
 * 验证备份类别数据
 */
function validateBackupCategory(data: unknown): data is BackupCategory {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const cat = data as Record<string, unknown>;
  return (
    typeof cat.uuid === 'string' &&
    typeof cat.name === 'string' &&
    typeof cat.color === 'string' &&
    typeof cat.sortOrder === 'number' &&
    typeof cat.createdAt === 'number' &&
    typeof cat.updatedAt === 'number'
  );
}

/**
 * 验证备份兑换码数据
 */
function validateBackupCode(data: unknown): data is BackupCode {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const code = data as Record<string, unknown>;
  return (
    typeof code.uuid === 'string' &&
    typeof code.code === 'string' &&
    (code.categoryUuid === null || typeof code.categoryUuid === 'string') &&
    (code.description === null || typeof code.description === 'string') &&
    (code.expireDate === null || typeof code.expireDate === 'number') &&
    typeof code.status === 'number' &&
    (code.notifyDays === null || typeof code.notifyDays === 'number') &&
    typeof code.isNotifyEnabled === 'boolean' &&
    typeof code.createdAt === 'number' &&
    typeof code.updatedAt === 'number' &&
    (code.usedAt === null || typeof code.usedAt === 'number')
  );
}
