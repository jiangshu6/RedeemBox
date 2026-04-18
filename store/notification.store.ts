import { create } from 'zustand';
import { NotificationRecordWithCode } from '@/types';
import { NotificationService } from '@/services/notification.service';

/**
 * 通知状态接口
 */
interface NotificationState {
  // 状态
  records: NotificationRecordWithCode[];
  loading: boolean;
  error: string | null;

  // 操作
  fetchHistory: () => Promise<void>;
  clearHistory: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * 通知状态管理
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  // 初始状态
  records: [],
  loading: false,
  error: null,

  // 获取通知历史
  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const records = await NotificationService.getHistory();
      set({ records, loading: false });
    } catch (error) {
      set({ error: '获取通知历史失败', loading: false });
    }
  },

  // 清除通知历史
  clearHistory: async () => {
    set({ loading: true, error: null });
    try {
      const count = await NotificationService.clearHistory();
      if (count > 0) {
        set({ records: [], loading: false });
        return true;
      }
      set({ loading: false });
      return false;
    } catch (error) {
      set({ error: '清除通知历史失败', loading: false });
      return false;
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));
