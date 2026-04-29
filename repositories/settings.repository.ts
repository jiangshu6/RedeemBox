import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ThemeMode, SettingsKeys, NotifyTime } from '@/types';
import { NotificationConstants } from '@/constants';

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: AppSettings = {
  notifyEnabled: true,
  defaultNotifyDays: NotificationConstants.DEFAULT_NOTIFY_DAYS,
  themeMode: 'system',
  lastCheckTime: null,
  notifyTime: NotificationConstants.DEFAULT_NOTIFY_TIME,
};

/**
 * 设置数据访问层
 */
export const SettingsRepository = {
  /**
   * 获取所有设置
   */
  async getSettings(): Promise<AppSettings> {
    const [notifyEnabled, defaultNotifyDays, themeMode, lastCheckTime, notifyTime] = await Promise.all([
      this.getNotifyEnabled(),
      this.getDefaultNotifyDays(),
      this.getThemeMode(),
      this.getLastCheckTime(),
      this.getNotifyTime(),
    ]);

    return {
      notifyEnabled,
      defaultNotifyDays,
      themeMode,
      lastCheckTime,
      notifyTime,
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
   * 获取通知时间
   */
  async getNotifyTime(): Promise<NotifyTime> {
    const value = await AsyncStorage.getItem(SettingsKeys.NOTIFY_TIME);
    if (value === null) {
      return DEFAULT_SETTINGS.notifyTime;
    }
    try {
      const parsed = JSON.parse(value);
      if (
        typeof parsed.hour === 'number' &&
        typeof parsed.minute === 'number' &&
        parsed.hour >= 0 && parsed.hour <= 23 &&
        parsed.minute >= 0 && parsed.minute <= 59
      ) {
        return { hour: parsed.hour, minute: parsed.minute };
      }
    } catch {
      // 解析失败，返回默认值
    }
    return DEFAULT_SETTINGS.notifyTime;
  },

  /**
   * 设置通知时间
   */
  async setNotifyTime(time: NotifyTime): Promise<void> {
    await AsyncStorage.setItem(SettingsKeys.NOTIFY_TIME, JSON.stringify(time));
  },

  /**
   * 重置所有设置为默认值
   */
  async resetToDefaults(): Promise<void> {
    await Promise.all([
      this.setNotifyEnabled(DEFAULT_SETTINGS.notifyEnabled),
      this.setDefaultNotifyDays(DEFAULT_SETTINGS.defaultNotifyDays),
      this.setThemeMode(DEFAULT_SETTINGS.themeMode),
      this.setNotifyTime(DEFAULT_SETTINGS.notifyTime),
      AsyncStorage.removeItem(SettingsKeys.LAST_CHECK_TIME),
    ]);
  },
};
