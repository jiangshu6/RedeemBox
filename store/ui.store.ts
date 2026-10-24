import { create } from 'zustand';
import { Toast } from '@ant-design/react-native';

/**
 * Toast类型
 */
type ToastType = 'success' | 'error' | 'info';

/**
 * Toast 样式（文字固定白色）
 */
const toastStyles = { content: { color: '#fff' } };

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
 * UI状态接口
 */
interface UIState {
  // 状态
  isLoading: boolean;
  loadingText: string | null;
  confirmDialog: ConfirmDialogConfig;

  // 操作
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (config: Omit<ConfirmDialogConfig, 'visible'>) => void;
  hideConfirm: () => void;
}

/**
 * UI状态管理
 */
export const useUIStore = create<UIState>((set) => ({
  // 初始状态
  isLoading: false,
  loadingText: null,
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

  // 显示Toast（使用 Ant Design Toast）
  showToast: (message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        Toast.show({ content: message, icon: 'success', styles: toastStyles });
        break;
      case 'error':
        Toast.show({ content: message, icon: 'fail', styles: toastStyles });
        break;
      case 'info':
      default:
        Toast.show({ content: message, styles: toastStyles });
        break;
    }
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
