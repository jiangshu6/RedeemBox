import { useCallback, useMemo } from 'react';
import { useCodeStore } from '@/store/code.store';
import { useUIStore } from '@/store/ui.store';
import { CreateCodeDTO, UpdateCodeDTO, CodeFilter, SortOption, RedemptionCode } from '@/types';

/**
 * 兑换码管理Hook
 */
export function useCodes() {
  const {
    codes,
    filteredCodes,
    selectedId,
    filter,
    sort,
    searchKeyword,
    loading,
    error,
    fetchCodes,
    createCode,
    updateCode,
    deleteCode,
    deleteCodes,
    setFilter,
    setSort,
    search,
    setSelectedId,
    clearError,
  } = useCodeStore();

  const { showLoading, hideLoading, showToast, showConfirm, hideConfirm } = useUIStore();

  /**
   * 加载兑换码列表
   */
  const loadCodes = useCallback(async () => {
    await fetchCodes();
  }, [fetchCodes]);

  /**
   * 创建新兑换码
   */
  const handleCreateCode = useCallback(async (data: CreateCodeDTO) => {
    showLoading('正在创建...');
    const success = await createCode(data);
    hideLoading();

    if (success) {
      showToast('兑换码创建成功', 'success');
      return true;
    } else {
      showToast(error ?? '创建失败', 'error');
      return false;
    }
  }, [createCode, showLoading, hideLoading, showToast, error]);

  /**
   * 更新兑换码
   */
  const handleUpdateCode = useCallback(async (id: number, data: UpdateCodeDTO) => {
    showLoading('正在更新...');
    const success = await updateCode(id, data);
    hideLoading();

    if (success) {
      showToast('兑换码更新成功', 'success');
      return true;
    } else {
      showToast(error ?? '更新失败', 'error');
      return false;
    }
  }, [updateCode, showLoading, hideLoading, showToast, error]);

  /**
   * 删除兑换码
   */
  const handleDeleteCode = useCallback(async (code: RedemptionCode) => {
    return new Promise<boolean>((resolve) => {
      showConfirm({
        title: '删除兑换码',
        message: `确定要删除兑换码"${code.code.slice(0, 20)}..."吗？`,
        confirmText: '删除',
        cancelText: '取消',
        danger: true,
        onConfirm: async () => {
          hideConfirm();
          showLoading('正在删除...');
          const success = await deleteCode(code.id);
          hideLoading();

          if (success) {
            showToast('兑换码已删除', 'success');
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
  }, [deleteCode, showConfirm, hideConfirm, showLoading, hideLoading, showToast, error]);

  /**
   * 批量删除兑换码
   */
  const handleDeleteCodes = useCallback(async (codes: RedemptionCode[]) => {
    return new Promise<boolean>((resolve) => {
      showConfirm({
        title: '批量删除',
        message: `确定要删除选中的 ${codes.length} 个兑换码吗？`,
        confirmText: '删除',
        cancelText: '取消',
        danger: true,
        onConfirm: async () => {
          hideConfirm();
          showLoading('正在删除...');
          const success = await deleteCodes(codes.map(c => c.id));
          hideLoading();

          if (success) {
            showToast('兑换码已删除', 'success');
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
  }, [deleteCodes, showConfirm, hideConfirm, showLoading, hideLoading, showToast, error]);

  /**
   * 标记为已使用
   */
  const handleMarkAsUsed = useCallback(async (code: RedemptionCode) => {
    showLoading('正在标记...');
    const success = await updateCode(code.id, { status: 2 }); // USED = 2
    hideLoading();

    if (success) {
      showToast('已标记为已使用', 'success');
      return true;
    } else {
      showToast(error ?? '标记失败', 'error');
      return false;
    }
  }, [updateCode, showLoading, hideLoading, showToast, error]);

  /**
   * 搜索兑换码
   */
  const handleSearch = useCallback((keyword: string) => {
    search(keyword);
  }, [search]);

  /**
   * 更新筛选条件
   */
  const handleSetFilter = useCallback((newFilter: Partial<CodeFilter>) => {
    setFilter(newFilter);
  }, [setFilter]);

  /**
   * 更新排序
   */
  const handleSetSort = useCallback((newSort: SortOption) => {
    setSort(newSort);
  }, [setSort]);

  /**
   * 清除筛选
   */
  const clearFilter = useCallback(() => {
    setFilter({
      categoryIds: [],
      status: null,
      expireRange: null,
    });
  }, [setFilter]);

  /**
   * 是否有筛选条件
   */
  const hasFilter = useMemo(() => {
    return filter.categoryIds.length > 0 || filter.status !== null || filter.expireRange !== null;
  }, [filter]);

  return {
    codes,
    filteredCodes,
    selectedId,
    filter,
    sort,
    searchKeyword,
    loading,
    error,
    loadCodes,
    createCode: handleCreateCode,
    updateCode: handleUpdateCode,
    deleteCode: handleDeleteCode,
    deleteCodes: handleDeleteCodes,
    markAsUsed: handleMarkAsUsed,
    search: handleSearch,
    setFilter: handleSetFilter,
    setSort: handleSetSort,
    clearFilter,
    hasFilter,
    setSelectedId,
    clearError,
  };
}
