import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  NotificationRecord,
  NotificationRecordWithCode,
} from '@/types';
import { NotificationRecordRepository } from '@/repositories/notification-record.repository';
import { CodeRepository } from '@/repositories/code.repository';
import { SettingsRepository } from '@/repositories/settings.repository';
import { formatExpireDate, getDaysUntilExpire } from '@/utils/date';
import { NotificationConstants, NOTIFICATION_CHANNEL_ID } from '@/constants';

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

    // 调度每日检查任务
    await this.scheduleDailyCheck();
  },

  /**
   * 调度每日检查任务
   */
  async scheduleDailyCheck(): Promise<void> {
    // 取消所有已调度的通知
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 检查通知开关
    const notifyEnabled = await SettingsRepository.getNotifyEnabled();
    if (!notifyEnabled) {
      return;
    }

    // 调度每日检查通知
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '兑换码检查',
        body: '正在检查即将到期的兑换码...',
        data: { type: 'daily-check' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: NotificationConstants.NOTIFY_CHECK_HOUR,
        minute: 0,
      },
    });
  },

  /**
   * 执行检查并发送通知
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

    // 获取今日已通知的兑换码ID
    const todayNotifiedIds = await NotificationRecordRepository.getTodayNotifiedCodeIds();

    // 过滤已通知的兑换码
    const toNotify = expiringCodes.filter(
      (code) => !todayNotifiedIds.includes(code.id)
    );

    // 发送通知
    let notifiedCount = 0;
    for (const code of toNotify) {
      const days = getDaysUntilExpire(code.expireDate);
      const content = `兑换码 "${code.code.slice(0, 20)}..." 将在 ${days} 天后到期 (${formatExpireDate(code.expireDate)})`;

      await this.sendNotification(code.id, content);
      notifiedCount++;
    }

    // 更新上次检查时间
    await SettingsRepository.setLastCheckTime(new Date().toISOString());

    return notifiedCount;
  },

  /**
   * 发送通知
   */
  async sendNotification(codeId: number, content: string): Promise<NotificationRecord | null> {
    try {
      // 发送本地通知
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '兑换码即将到期',
          body: content,
          data: { codeId, type: 'expiry-reminder' },
        },
        trigger: null, // 立即发送
      });

      // 记录通知历史
      const record = await NotificationRecordRepository.create({
        redemptionCodeId: codeId,
        content,
      });

      return record;
    } catch (error) {
      console.error('发送通知失败:', error);
      return null;
    }
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
