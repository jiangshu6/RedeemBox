/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 应用设置
 */
export interface AppSettings {
  notifyEnabled: boolean;
  defaultNotifyDays: number;
  themeMode: ThemeMode;
  lastCheckTime: string | null;
}

/**
 * 设置存储键名
 */
export const SettingsKeys = {
  NOTIFY_ENABLED: 'settings.notifyEnabled',
  DEFAULT_NOTIFY_DAYS: 'settings.defaultNotifyDays',
  THEME_MODE: 'settings.themeMode',
  LAST_CHECK_TIME: 'settings.lastCheckTime',
} as const;
