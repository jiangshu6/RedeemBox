import { useCallback } from 'react';
import { exportBackup, importBackup } from '@/services/backup.service';
import { useUIStore } from '@/store/ui.store';
import { useCategoryStore } from '@/store/category.store';
import { useCodeStore } from '@/store/code.store';
import { ImportResult } from '@/types';

/**
 * 备份相关 Hook
 */
export function useBackup() {
  const { showLoading, hideLoading, showToast, showConfirm, hideConfirm } = useUIStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchCodes } = useCodeStore();

  /**
   * 导出备份
   */
  const handleExport = useCallback(async () => {
    showConfirm({
      title: '数据备份',
      message: '是否导出所有数据？',
      confirmText: '导出',
      cancelText: '取消',
      onConfirm: async () => {
        hideConfirm();
        showLoading('正在导出...');

        try {
          const success = await exportBackup();
          hideLoading();

          if (success) {
            showToast('备份成功', 'success');
          } else {
            showToast('备份已取消', 'info');
          }
        } catch (error) {
          hideLoading();
          showToast('备份失败', 'error');
        }
      },
      onCancel: () => {
        hideConfirm();
      },
    });
  }, [showConfirm, hideConfirm, showLoading, hideLoading, showToast]);

  /**
   * 导入备份
   */
  const handleImport = useCallback(async () => {
    showLoading('正在导入...');

    try {
      const result: ImportResult = await importBackup();
      hideLoading();

      if (result.success) {
        // 刷新数据
        await Promise.all([fetchCategories(), fetchCodes()]);

        const totalImported = result.categoriesImported + result.codesImported;
        const totalSkipped = result.categoriesSkipped + result.codesSkipped;

        let message = `导入成功：${result.categoriesImported} 条类别，${result.codesImported} 条兑换码`;
        if (totalSkipped > 0) {
          message += `\n跳过 ${totalSkipped} 条已存在的数据`;
        }

        showToast(message, 'success');
      } else {
        showToast(result.error || '导入失败', 'error');
      }
    } catch (error) {
      hideLoading();
      showToast('导入失败', 'error');
    }
  }, [showLoading, hideLoading, showToast, fetchCategories, fetchCodes]);

  return {
    handleExport,
    handleImport,
  };
}
