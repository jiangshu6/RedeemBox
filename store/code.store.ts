import { create } from 'zustand';
import {
  RedemptionCode,
  CreateCodeDTO,
  UpdateCodeDTO,
  CodeFilter,
  SortOption,
  RedemptionCodeStatus,
} from '@/types';
import { RedemptionCodeService } from '@/services/redemption-code.service';
import { debounce } from '@/utils/helpers';

/**
 * 兑换码状态接口
 */
interface CodeState {
  // 状态
  codes: RedemptionCode[];
  filteredCodes: RedemptionCode[];
  selectedId: number | null;
  filter: CodeFilter;
  sort: SortOption;
  searchKeyword: string;
  loading: boolean;
  error: string | null;

  // 操作
  fetchCodes: () => Promise<void>;
  createCode: (data: CreateCodeDTO) => Promise<boolean>;
  updateCode: (id: number, data: UpdateCodeDTO) => Promise<boolean>;
  deleteCode: (id: number) => Promise<boolean>;
  deleteCodes: (ids: number[]) => Promise<boolean>;
  setFilter: (filter: Partial<CodeFilter>) => void;
  setSort: (sort: SortOption) => void;
  search: (keyword: string) => void;
  setSelectedId: (id: number | null) => void;
  clearError: () => void;
  applyFilterAndSort: () => void;
}

/**
 * 默认筛选条件
 */
const defaultFilter: CodeFilter = {
  categoryIds: [],
  status: null,
  expireRange: null,
};

/**
 * 默认排序
 */
const defaultSort: SortOption = {
  field: 'createdAt',
  order: 'desc',
};

/**
 * 兑换码状态管理
 */
export const useCodeStore = create<CodeState>((set, get) => ({
  // 初始状态
  codes: [],
  filteredCodes: [],
  selectedId: null,
  filter: defaultFilter,
  sort: defaultSort,
  searchKeyword: '',
  loading: false,
  error: null,

  // 获取兑换码列表
  fetchCodes: async () => {
    set({ loading: true, error: null });
    const result = await RedemptionCodeService.getCodes();
    if (result.success && result.data) {
      set({ codes: result.data, loading: false });
      get().applyFilterAndSort();
    } else {
      set({ error: result.error ?? '获取列表失败', loading: false });
    }
  },

  // 创建兑换码
  createCode: async (data: CreateCodeDTO) => {
    set({ loading: true, error: null });
    const result = await RedemptionCodeService.createCode(data);
    if (result.success) {
      await get().fetchCodes();
      return true;
    }
    set({ error: result.error ?? '创建失败', loading: false });
    return false;
  },

  // 更新兑换码
  updateCode: async (id: number, data: UpdateCodeDTO) => {
    set({ loading: true, error: null });
    const result = await RedemptionCodeService.updateCode(id, data);
    if (result.success) {
      await get().fetchCodes();
      return true;
    }
    set({ error: result.error ?? '更新失败', loading: false });
    return false;
  },

  // 删除兑换码
  deleteCode: async (id: number) => {
    set({ loading: true, error: null });
    const result = await RedemptionCodeService.deleteCode(id);
    if (result.success) {
      await get().fetchCodes();
      return true;
    }
    set({ error: result.error ?? '删除失败', loading: false });
    return false;
  },

  // 批量删除兑换码
  deleteCodes: async (ids: number[]) => {
    set({ loading: true, error: null });
    const result = await RedemptionCodeService.deleteCodes(ids);
    if (result.success) {
      await get().fetchCodes();
      return true;
    }
    set({ error: result.error ?? '批量删除失败', loading: false });
    return false;
  },

  // 设置筛选条件
  setFilter: (filter: Partial<CodeFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }));
    get().applyFilterAndSort();
  },

  // 设置排序
  setSort: (sort: SortOption) => {
    set({ sort });
    get().applyFilterAndSort();
  },

  // 搜索（带防抖）
  search: debounce((keyword: string) => {
    set({ searchKeyword: keyword });
    get().applyFilterAndSort();
  }, 300),

  // 设置选中的兑换码ID
  setSelectedId: (id: number | null) => {
    set({ selectedId: id });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 应用筛选和排序
  applyFilterAndSort: () => {
    const { codes, filter, sort, searchKeyword } = get();
    let filtered = [...codes];

    // 搜索过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(keyword) ||
          (code.description?.toLowerCase().includes(keyword) ?? false)
      );
    }

    // 类别筛选
    if (filter.categoryIds.length > 0) {
      filtered = filtered.filter(
        (code) => code.categoryId !== null && filter.categoryIds.includes(code.categoryId)
      );
    }

    // 状态筛选
    if (filter.status !== null) {
      filtered = filtered.filter((code) => code.status === filter.status);
    }

    // 到期时间筛选
    if (filter.expireRange === 'expiring') {
      const now = Date.now();
      const threeDaysLater = now + 3 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(
        (code) =>
          code.expireDate !== null &&
          code.expireDate > now &&
          code.expireDate <= threeDaysLater &&
          code.status === RedemptionCodeStatus.ACTIVE
      );
    } else if (filter.expireRange === 'thisMonth') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      filtered = filtered.filter(
        (code) =>
          code.expireDate !== null &&
          code.expireDate >= monthStart.getTime() &&
          code.expireDate <= monthEnd.getTime()
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let valueA: number;
      let valueB: number;

      switch (sort.field) {
        case 'expireDate':
          valueA = a.expireDate ?? Number.MAX_SAFE_INTEGER;
          valueB = b.expireDate ?? Number.MAX_SAFE_INTEGER;
          break;
        case 'updatedAt':
          valueA = a.updatedAt;
          valueB = b.updatedAt;
          break;
        case 'createdAt':
        default:
          valueA = a.createdAt;
          valueB = b.createdAt;
          break;
      }

      return sort.order === 'asc' ? valueA - valueB : valueB - valueA;
    });

    set({ filteredCodes: filtered });
  },
}));
