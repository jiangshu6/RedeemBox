import { create } from 'zustand';

/**
 * Toast类型
 */
type ToastType = 'success' | 'error' | 'info';

/**
 * 确认对话框配置
 */
interface ConfirmDialogConfig {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * Toast配置
 */
interface ToastConfig {
  visible: boolean;
  message: string;
  type: ToastType;
}

/**
 * UI状态接口
 */
interface UIState {
  // 状态
  isLoading: boolean;
  loadingText: string | null;
  toast: ToastConfig;
  confirmDialog: ConfirmDialogConfig;

  // 操作
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  showConfirm: (config: Omit<ConfirmDialogConfig, 'visible'>) => void;
  hideConfirm: () => void;
}

/**
 * UI状态管理
 */
export const useUIStore = create<UIState>((set, get) => ({
  // 初始状态
  isLoading: false,
  loadingText: null,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  confirmDialog: {
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },

  // 显示加载状态
  showLoading: (text?: string) => {
    set({ isLoading: true, loadingText: text ?? null });
  },

  // 隐藏加载状态
  hideLoading: () => {
    set({ isLoading: false, loadingText: null });
  },

  // 显示Toast
  showToast: (message: string, type: ToastType = 'info') => {
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    });

    // 3秒后自动隐藏
    setTimeout(() => {
      get().hideToast();
    }, 3000);
  },

  // 隐藏Toast
  hideToast: () => {
    set((state) => ({
      toast: {
        ...state.toast,
        visible: false,
      },
    }));
  },

  // 显示确认对话框
  showConfirm: (config: Omit<ConfirmDialogConfig, 'visible'>) => {
    set({
      confirmDialog: {
        ...config,
        visible: true,
      },
    });
  },

  // 隐藏确认对话框
  hideConfirm: () => {
    set((state) => ({
      confirmDialog: {
        ...state.confirmDialog,
        visible: false,
      },
    }));
  },
}));
