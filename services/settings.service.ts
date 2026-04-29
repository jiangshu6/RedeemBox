import { AppSettings, ThemeMode, NotifyTime } from '@/types';
import { SettingsRepository } from '@/repositories/settings.repository';
import { validateNotifyDays } from '@/utils/validation';
import { NotificationConstants } from '@/constants';

/**
 * 验证结果
 */
interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 设置业务服务
 */
export const SettingsService = {
  /**
   * 获取所有设置
   */
  async getSettings(): Promise<ServiceResult<AppSettings>> {
    try {
      const settings = await SettingsRepository.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: '获取设置失败' };
    }
  },

  /**
   * 设置通知开关
   */
  async setNotifyEnabled(enabled: boolean): Promise<ServiceResult> {
    try {
      await SettingsRepository.setNotifyEnabled(enabled);
      return { success: true };
    } catch (error) {
      return { success: false, error: '设置通知开关失败' };
    }
  },

  /**
   * 设置默认通知天数
   */
  async setDefaultNotifyDays(days: number): Promise<ServiceResult> {
    // 验证通知天数
    const validation = validateNotifyDays(days);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    try {
      await SettingsRepository.setDefaultNotifyDays(days);
      return { success: true };
    } catch (error) {
      return { success: false, error: '设置通知天数失败' };
    }
  },

  /**
   * 获取通知开关
   */
  async getNotifyEnabled(): Promise<ServiceResult<boolean>> {
    try {
      const enabled = await SettingsRepository.getNotifyEnabled();
      return { success: true, data: enabled };
    } catch (error) {
      return { success: false, error: '获取通知开关失败' };
    }
  },

  /**
   * 获取默认通知天数
   */
  async getDefaultNotifyDays(): Promise<ServiceResult<number>> {
    try {
      const days = await SettingsRepository.getDefaultNotifyDays();
      return { success: true, data: days };
    } catch (error) {
      return { success: false, error: '获取通知天数失败' };
    }
  },

  /**
   * 获取主题模式
   */
  async getThemeMode(): Promise<ServiceResult<ThemeMode>> {
    try {
      const mode = await SettingsRepository.getThemeMode();
      return { success: true, data: mode };
    } catch (error) {
      return { success: false, error: '获取主题模式失败' };
    }
  },

  /**
   * 设置主题模式
   */
  async setThemeMode(mode: ThemeMode): Promise<ServiceResult> {
    try {
      await SettingsRepository.setThemeMode(mode);
      return { success: true };
    } catch (error) {
      return { success: false, error: '设置主题模式失败' };
    }
  },

  /**
   * 获取通知时间
   */
  async getNotifyTime(): Promise<ServiceResult<NotifyTime>> {
    try {
      const time = await SettingsRepository.getNotifyTime();
      return { success: true, data: time };
    } catch (error) {
      return { success: false, error: '获取通知时间失败' };
    }
  },

  /**
   * 设置通知时间
   */
  async setNotifyTime(time: NotifyTime): Promise<ServiceResult> {
    // 验证时间格式
    if (
      typeof time.hour !== 'number' ||
      typeof time.minute !== 'number' ||
      time.hour < 0 ||
      time.hour > 23 ||
      time.minute < 0 ||
      time.minute > 59
    ) {
      return { success: false, error: '时间格式无效' };
    }

    try {
      await SettingsRepository.setNotifyTime(time);
      return { success: true };
    } catch (error) {
      return { success: false, error: '设置通知时间失败' };
    }
  },

  /**
   * 重置设置为默认值
   */
  async resetToDefaults(): Promise<ServiceResult> {
    try {
      await SettingsRepository.resetToDefaults();
      return { success: true };
    } catch (error) {
      return { success: false, error: '重置设置失败' };
    }
  },

  /**
   * 获取默认通知天数常量
   */
  getDefaultNotifyDaysConstants(): {
    min: number;
    max: number;
    default: number;
  } {
    return {
      min: NotificationConstants.MIN_NOTIFY_DAYS,
      max: NotificationConstants.MAX_NOTIFY_DAYS,
      default: NotificationConstants.DEFAULT_NOTIFY_DAYS,
    };
  },
};
