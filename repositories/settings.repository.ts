import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ThemeMode, SettingsKeys } from '@/types';
import { NotificationConstants } from '@/constants';

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: AppSettings = {
  notifyEnabled: true,
  defaultNotifyDays: NotificationConstants.DEFAULT_NOTIFY_DAYS,
  themeMode: 'system',
  lastCheckTime: null,
};

/**
 * 设置数据访问层
 */
export const SettingsRepository = {
  /**
   * 获取所有设置
   */
  async getSettings(): Promise<AppSettings> {
    const [notifyEnabled, defaultNotifyDays, themeMode, lastCheckTime] = await Promise.all([
      this.getNotifyEnabled(),
      this.getDefaultNotifyDays(),
      this.getThemeMode(),
      this.getLastCheckTime(),
    ]);

    return {
      notifyEnabled,
      defaultNotifyDays,
      themeMode,
      lastCheckTime,
    };
  },

  /**
   * 获取通知开关
   */
  async getNotifyEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(SettingsKeys.NOTIFY_ENABLED);
    return value !== 'false'; // 默认 true
  },

  /**
   * 设置通知开关
   */
  async setNotifyEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(SettingsKeys.NOTIFY_ENABLED, String(enabled));
  },

  /**
   * 获取默认通知天数
   */
  async getDefaultNotifyDays(): Promise<number> {
    const value = await AsyncStorage.getItem(SettingsKeys.DEFAULT_NOTIFY_DAYS);
    if (value === null) {
      return DEFAULT_SETTINGS.defaultNotifyDays;
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? DEFAULT_SETTINGS.defaultNotifyDays : parsed;
  },

  /**
   * 设置默认通知天数
   */
  async setDefaultNotifyDays(days: number): Promise<void> {
    await AsyncStorage.setItem(SettingsKeys.DEFAULT_NOTIFY_DAYS, String(days));
  },

  /**
   * 获取主题模式
   */
  async getThemeMode(): Promise<ThemeMode> {
    const value = await AsyncStorage.getItem(SettingsKeys.THEME_MODE);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return DEFAULT_SETTINGS.themeMode;
  },

  /**
   * 设置主题模式
   */
  async setThemeMode(mode: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(SettingsKeys.THEME_MODE, mode);
  },

  /**
   * 获取上次检查时间
   */
  async getLastCheckTime(): Promise<string | null> {
    return AsyncStorage.getItem(SettingsKeys.LAST_CHECK_TIME);
  },

  /**
   * 设置上次检查时间
   */
  async setLastCheckTime(time: string): Promise<void> {
    await AsyncStorage.setItem(SettingsKeys.LAST_CHECK_TIME, time);
  },

  /**
   * 重置所有设置为默认值
   */
  async resetToDefaults(): Promise<void> {
    await Promise.all([
      this.setNotifyEnabled(DEFAULT_SETTINGS.notifyEnabled),
      this.setDefaultNotifyDays(DEFAULT_SETTINGS.defaultNotifyDays),
      this.setThemeMode(DEFAULT_SETTINGS.themeMode),
      AsyncStorage.removeItem(SettingsKeys.LAST_CHECK_TIME),
    ]);
  },
};
