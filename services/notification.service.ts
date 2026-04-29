import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  NotificationRecordWithCode,
} from '@/types';
import { NotificationRecordRepository } from '@/repositories/notification-record.repository';
import { CodeRepository } from '@/repositories/code.repository';
import { SettingsRepository } from '@/repositories/settings.repository';
import { NOTIFICATION_CHANNEL_ID } from '@/constants';
import { formatExpireDate, getDaysUntilExpire } from '@/utils/date';

/**
 * 配置通知处理器
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * 检查通知权限
 */
export async function checkNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * 通知业务服务
 */
export const NotificationService = {
  /**
   * 初始化通知服务
   */
  async initialize(): Promise<void> {
    configureNotifications();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: '兑换码到期提醒',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
      });
    }

    // 检查并更新过期状态
    await CodeRepository.updateExpiredStatus();

    // 检查并记录今日通知历史
    await this.recordTodayNotifications();

    // 调度每日检查任务
    await this.scheduleDailyCheck();
  },

  /**
   * 检查并记录今日通知历史
   * 在应用启动时检查是否有新的即将到期的兑换码需要记录
   */
  async recordTodayNotifications(): Promise<void> {
    // 检查通知开关
    const notifyEnabled = await SettingsRepository.getNotifyEnabled();
    if (!notifyEnabled) {
      return;
    }

    // 获取默认通知天数
    const defaultNotifyDays = await SettingsRepository.getDefaultNotifyDays();

    // 获取即将到期的兑换码
    const expiringCodes = await CodeRepository.getExpiringCodes(defaultNotifyDays);

    // 获取今日已通知的兑换码ID
    const todayNotifiedIds = await NotificationRecordRepository.getTodayNotifiedCodeIds();

    // 过滤出今天未记录的兑换码
    const toRecord = expiringCodes.filter(
      (code) => !todayNotifiedIds.includes(code.id)
    );

    // 记录通知历史
    for (const code of toRecord) {
      const days = getDaysUntilExpire(code.expireDate);
      const content = `兑换码 "${code.code.slice(0, 20)}..." 将在 ${days} 天后到期 (${formatExpireDate(code.expireDate)})`;
      
      await NotificationRecordRepository.create({
        redemptionCodeId: code.id,
        content,
      });
    }
  },

  /**
   * 调度每日检查任务
   * 每天在设定时间发送汇总通知（仅在有即将到期的兑换码时）
   */
  async scheduleDailyCheck(): Promise<void> {
    // 取消所有已调度的通知
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 检查通知开关
    const notifyEnabled = await SettingsRepository.getNotifyEnabled();
    if (!notifyEnabled) {
      return;
    }

    // 获取默认通知天数
    const defaultNotifyDays = await SettingsRepository.getDefaultNotifyDays();

    // 获取即将到期的兑换码数量
    const expiringCodes = await CodeRepository.getExpiringCodes(defaultNotifyDays);

    // 没有即将到期的兑换码时，不调度通知
    if (expiringCodes.length === 0) {
      return;
    }

    // 获取用户设置的通知时间
    const notifyTime = await SettingsRepository.getNotifyTime();

    // 调度每日汇总通知
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '兑换码到期提醒',
        body: `您有 ${expiringCodes.length} 个兑换码即将到期，请及时使用`,
        data: { 
          type: 'daily-summary',
          count: expiringCodes.length,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: notifyTime.hour,
        minute: notifyTime.minute,
      },
    });
  },

  /**
   * 执行检查并发送通知（手动触发时使用）
   * 仅在有即将到期的兑换码时发送通知
   */
  async checkAndNotify(): Promise<number> {
    // 检查通知开关
    const notifyEnabled = await SettingsRepository.getNotifyEnabled();
    if (!notifyEnabled) {
      return 0;
    }

    // 更新过期状态
    await CodeRepository.updateExpiredStatus();

    // 获取默认通知天数
    const defaultNotifyDays = await SettingsRepository.getDefaultNotifyDays();

    // 获取即将到期的兑换码
    const expiringCodes = await CodeRepository.getExpiringCodes(defaultNotifyDays);

    // 更新上次检查时间
    await SettingsRepository.setLastCheckTime(new Date().toISOString());

    // 没有即将到期的兑换码时，不发送通知
    if (expiringCodes.length === 0) {
      return 0;
    }

    // 发送汇总通知
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '兑换码到期提醒',
        body: `您有 ${expiringCodes.length} 个兑换码即将到期，请及时使用`,
        data: { 
          type: 'daily-summary',
          count: expiringCodes.length,
        },
      },
      trigger: null, // 立即发送
    });

    // 记录通知历史（为每个即将到期的兑换码创建记录）
    for (const code of expiringCodes) {
      const days = getDaysUntilExpire(code.expireDate);
      const content = `兑换码 "${code.code.slice(0, 20)}..." 将在 ${days} 天后到期 (${formatExpireDate(code.expireDate)})`;
      
      await NotificationRecordRepository.create({
        redemptionCodeId: code.id,
        content,
      });
    }

    return expiringCodes.length;
  },

  /**
   * 处理通知点击
   */
  async handleNotificationClick(notification: Notifications.Notification): Promise<number | null> {
    const data = notification.request.content.data as { codeId?: number } | undefined;
    const codeId = data?.codeId;

    if (codeId) {
      // 更新通知状态为已点击
      const records = await NotificationRecordRepository.getByCodeId(codeId);
      if (records.length > 0) {
        await NotificationRecordRepository.updateClicked(records[0].id);
      }
    }

    return codeId ?? null;
  },

  /**
   * 获取通知历史
   */
  async getHistory(): Promise<NotificationRecordWithCode[]> {
    return NotificationRecordRepository.getAllWithCode();
  },

  /**
   * 清除通知历史
   */
  async clearHistory(): Promise<number> {
    return NotificationRecordRepository.clearAll();
  },

  /**
   * 获取通知记录数量
   */
  async getHistoryCount(): Promise<number> {
    return NotificationRecordRepository.getCount();
  },
};
