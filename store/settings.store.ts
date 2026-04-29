import { create } from 'zustand';
import { AppSettings, ThemeMode, NotifyTime } from '@/types';
import { SettingsService } from '@/services/settings.service';
import { NotificationConstants } from '@/constants';

/**
 * 设置状态接口
 */
interface SettingsState {
  // 状态
  notifyEnabled: boolean;
  defaultNotifyDays: number;
  themeMode: ThemeMode;
  lastCheckTime: string | null;
  notifyTime: NotifyTime;
  loading: boolean;
  error: string | null;

  // 操作
  loadSettings: () => Promise<void>;
  setNotifyEnabled: (enabled: boolean) => Promise<boolean>;
  setDefaultNotifyDays: (days: number) => Promise<boolean>;
  setThemeMode: (mode: ThemeMode) => Promise<boolean>;
  setNotifyTime: (time: NotifyTime) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * 设置状态管理
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  // 初始状态
  notifyEnabled: true,
  defaultNotifyDays: 3,
  themeMode: 'system',
  lastCheckTime: null,
  notifyTime: NotificationConstants.DEFAULT_NOTIFY_TIME,
  loading: false,
  error: null,

  // 加载设置
  loadSettings: async () => {
    set({ loading: true, error: null });
    const result = await SettingsService.getSettings();
    if (result.success && result.data) {
      const settings: AppSettings = result.data;
      set({
        notifyEnabled: settings.notifyEnabled,
        defaultNotifyDays: settings.defaultNotifyDays,
        themeMode: settings.themeMode,
        lastCheckTime: settings.lastCheckTime,
        notifyTime: settings.notifyTime,
        loading: false,
      });
    } else {
      set({ error: result.error ?? '加载设置失败', loading: false });
    }
  },

  // 设置通知开关
  setNotifyEnabled: async (enabled: boolean) => {
    set({ loading: true, error: null });
    const result = await SettingsService.setNotifyEnabled(enabled);
    if (result.success) {
      set({ notifyEnabled: enabled, loading: false });
      return true;
    }
    set({ error: result.error ?? '设置通知开关失败', loading: false });
    return false;
  },

  // 设置默认通知天数
  setDefaultNotifyDays: async (days: number) => {
    set({ loading: true, error: null });
    const result = await SettingsService.setDefaultNotifyDays(days);
    if (result.success) {
      set({ defaultNotifyDays: days, loading: false });
      return true;
    }
    set({ error: result.error ?? '设置通知天数失败', loading: false });
    return false;
  },

  // 设置主题模式
  setThemeMode: async (mode: ThemeMode) => {
    set({ loading: true, error: null });
    const result = await SettingsService.setThemeMode(mode);
    if (result.success) {
      set({ themeMode: mode, loading: false });
      return true;
    }
    set({ error: result.error ?? '设置主题模式失败', loading: false });
    return false;
  },

  // 设置通知时间
  setNotifyTime: async (time: NotifyTime) => {
    set({ loading: true, error: null });
    const result = await SettingsService.setNotifyTime(time);
    if (result.success) {
      set({ notifyTime: time, loading: false });
      return true;
    }
    set({ error: result.error ?? '设置通知时间失败', loading: false });
    return false;
  },

  // 重置为默认设置
  resetToDefaults: async () => {
    set({ loading: true, error: null });
    const result = await SettingsService.resetToDefaults();
    if (result.success) {
      await get().loadSettings();
      return true;
    }
    set({ error: result.error ?? '重置设置失败', loading: false });
    return false;
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));
