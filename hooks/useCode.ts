import { useState, useCallback, useEffect, useMemo } from 'react';
import { RedemptionCode, RedemptionCodeStatus } from '@/types';
import { CodeRepository } from '@/repositories/code.repository';
import { useCategoryStore } from '@/store/category.store';
import { useUIStore } from '@/store/ui.store';
import { ClipboardService } from '@/services/clipboard.service';

/**
 * 兑换码详情Hook
 */
export function useCode(id: number | null) {
  const [code, setCode] = useState<RedemptionCode | null>(null);
  const [loading, setLoading] = useState(true);

  const { categories, fetchCategories } = useCategoryStore();
  const { showToast, showConfirm, hideConfirm, showLoading, hideLoading } = useUIStore();

  // 类别ID到名称的映射
  const categoryNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // 加载兑换码数据
  const loadCode = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const codeData = await CodeRepository.getById(id);
    setCode(codeData);
    setLoading(false);
  }, [id]);

  // 初始化
  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCode(), fetchCategories()]);
    };
    init();
  }, [loadCode, fetchCategories]);

  /**
   * 复制兑换码
   */
  const copyCode = useCallback(async () => {
    if (!code) return;
    const success = await ClipboardService.copy(code.code);
    if (success) {
      showToast('已复制到剪贴板', 'success');
    } else {
      showToast('复制失败', 'error');
    }
  }, [code, showToast]);

  /**
   * 标记为已使用
   */
  const markAsUsed = useCallback(async () => {
    if (!code) return false;

    return new Promise<boolean>((resolve) => {
      showConfirm({
        title: '标记为已使用',
        message: '确定要将此兑换码标记为已使用吗？',
        confirmText: '确定',
        cancelText: '取消',
        onConfirm: async () => {
          hideConfirm();
          showLoading('正在标记...');
          const updated = await CodeRepository.markAsUsed(code.id);
          hideLoading();

          if (updated) {
            setCode(updated);
            showToast('已标记为已使用', 'success');
            resolve(true);
          } else {
            showToast('标记失败', 'error');
            resolve(false);
          }
        },
        onCancel: () => {
          hideConfirm();
          resolve(false);
        },
      });
    });
  }, [code, showConfirm, hideConfirm, showLoading, hideLoading, showToast]);

  /**
   * 删除兑换码
   */
  const deleteCode = useCallback(async () => {
    if (!code) return false;

    return new Promise<boolean>((resolve) => {
      showConfirm({
        title: '删除兑换码',
        message: '确定要删除此兑换码吗？此操作不可恢复。',
        confirmText: '删除',
        cancelText: '取消',
        danger: true,
        onConfirm: async () => {
          hideConfirm();
          showLoading('正在删除...');
          const success = await CodeRepository.delete(code.id);
          hideLoading();

          if (success) {
            showToast('兑换码已删除', 'success');
            resolve(true);
          } else {
            showToast('删除失败', 'error');
            resolve(false);
          }
        },
        onCancel: () => {
          hideConfirm();
          resolve(false);
        },
      });
    });
  }, [code, showConfirm, hideConfirm, showLoading, hideLoading, showToast]);

  /**
   * 获取类别名称
   */
  const getCategoryName = useCallback((categoryId: number | null) => {
    if (!categoryId) return null;
    return categoryNameMap[categoryId] ?? null;
  }, [categoryNameMap]);

  return {
    code,
    loading,
    categoryNameMap,
    loadCode,
    copyCode,
    markAsUsed,
    deleteCode,
    getCategoryName,
  };
}
