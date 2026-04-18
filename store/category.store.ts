import { create } from 'zustand';
import { Category, CategoryWithCount, CreateCategoryDTO, UpdateCategoryDTO } from '@/types';
import { CategoryService } from '@/services/category.service';

/**
 * 类别状态接口
 */
interface CategoryState {
  // 状态
  categories: CategoryWithCount[];
  selectedId: number | null;
  loading: boolean;
  error: string | null;

  // 操作
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryDTO) => Promise<boolean>;
  updateCategory: (id: number, data: UpdateCategoryDTO) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  reorderCategories: (ids: number[]) => Promise<boolean>;
  setSelectedId: (id: number | null) => void;
  clearError: () => void;
}

/**
 * 类别状态管理
 */
export const useCategoryStore = create<CategoryState>((set, get) => ({
  // 初始状态
  categories: [],
  selectedId: null,
  loading: false,
  error: null,

  // 获取类别列表
  fetchCategories: async () => {
    set({ loading: true, error: null });
    const result = await CategoryService.getCategoriesWithCount();
    if (result.success && result.data) {
      set({ categories: result.data, loading: false });
    } else {
      set({ error: result.error ?? '获取类别列表失败', loading: false });
    }
  },

  // 创建类别
  createCategory: async (data: CreateCategoryDTO) => {
    set({ loading: true, error: null });
    const result = await CategoryService.createCategory(data);
    if (result.success) {
      await get().fetchCategories();
      return true;
    }
    set({ error: result.error ?? '创建类别失败', loading: false });
    return false;
  },

  // 更新类别
  updateCategory: async (id: number, data: UpdateCategoryDTO) => {
    set({ loading: true, error: null });
    const result = await CategoryService.updateCategory(id, data);
    if (result.success) {
      await get().fetchCategories();
      return true;
    }
    set({ error: result.error ?? '更新类别失败', loading: false });
    return false;
  },

  // 删除类别
  deleteCategory: async (id: number) => {
    set({ loading: true, error: null });
    const result = await CategoryService.deleteCategory(id);
    if (result.success) {
      await get().fetchCategories();
      return true;
    }
    set({ error: result.error ?? '删除类别失败', loading: false });
    return false;
  },

  // 重新排序类别
  reorderCategories: async (ids: number[]) => {
    set({ loading: true, error: null });
    const result = await CategoryService.reorderCategories(ids);
    if (result.success) {
      await get().fetchCategories();
      return true;
    }
    set({ error: result.error ?? '排序失败', loading: false });
    return false;
  },

  // 设置选中的类别ID
  setSelectedId: (id: number | null) => {
    set({ selectedId: id });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));
