import { useCallback } from 'react';
import { useCategoryStore } from '@/store/category.store';
import { useUIStore } from '@/store/ui.store';
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryWithCount } from '@/types';

/**
 * 类别管理Hook
 */
export function useCategories() {
  const {
    categories,
    selectedId,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    setSelectedId,
    clearError,
  } = useCategoryStore();

  const { showLoading, hideLoading, showToast, showConfirm, hideConfirm } = useUIStore();

  /**
   * 加载类别列表
   */
  const loadCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  /**
   * 创建新类别
   */
  const handleCreateCategory = useCallback(async (data: CreateCategoryDTO) => {
    showLoading('正在创建...');
    const success = await createCategory(data);
    hideLoading();

    if (success) {
      showToast('类别创建成功', 'success');
      return true;
    } else {
      showToast(error ?? '创建失败', 'error');
      return false;
    }
  }, [createCategory, showLoading, hideLoading, showToast, error]);

  /**
   * 更新类别
   */
  const handleUpdateCategory = useCallback(async (id: number, data: UpdateCategoryDTO) => {
    showLoading('正在更新...');
    const success = await updateCategory(id, data);
    hideLoading();

    if (success) {
      showToast('类别更新成功', 'success');
      return true;
    } else {
      showToast(error ?? '更新失败', 'error');
      return false;
    }
  }, [updateCategory, showLoading, hideLoading, showToast, error]);

  /**
   * 删除类别
   */
  const handleDeleteCategory = useCallback(async (category: CategoryWithCount) => {
    return new Promise<boolean>((resolve) => {
      showConfirm({
        title: '删除类别',
        message: `确定要删除类别"${category.name}"吗？${category.codeCount > 0 ? `\n\n该类别下有 ${category.codeCount} 个兑换码，删除后将变为未分类。` : ''}`,
        confirmText: '删除',
        cancelText: '取消',
        danger: true,
        onConfirm: async () => {
          hideConfirm();
          showLoading('正在删除...');
          const success = await deleteCategory(category.id);
          hideLoading();

          if (success) {
            showToast('类别已删除', 'success');
            resolve(true);
          } else {
            showToast(error ?? '删除失败', 'error');
            resolve(false);
          }
        },
        onCancel: () => {
          hideConfirm();
          resolve(false);
        },
      });
    });
  }, [deleteCategory, showConfirm, hideConfirm, showLoading, hideLoading, showToast, error]);

  /**
   * 重新排序类别
   */
  const handleReorderCategories = useCallback(async (ids: number[]) => {
    const success = await reorderCategories(ids);
    if (!success) {
      showToast('排序失败', 'error');
    }
    return success;
  }, [reorderCategories, showToast]);

  return {
    categories,
    selectedId,
    loading,
    error,
    loadCategories,
    createCategory: handleCreateCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    reorderCategories: handleReorderCategories,
    setSelectedId,
    clearError,
  };
}
