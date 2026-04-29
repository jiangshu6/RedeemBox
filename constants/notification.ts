/**
 * 通知相关常量
 */
export const NotificationConstants = {
  // 最小通知天数
  MIN_NOTIFY_DAYS: 1,
  // 最大通知天数
  MAX_NOTIFY_DAYS: 30,
  // 默认通知天数
  DEFAULT_NOTIFY_DAYS: 3,
  // 默认通知时间
  DEFAULT_NOTIFY_TIME: { hour: 9, minute: 0 },
  // 预设通知时间选项
  PRESET_NOTIFY_TIMES: [
    { hour: 8, minute: 0, label: '8:00' },
    { hour: 9, minute: 0, label: '9:00' },
    { hour: 12, minute: 0, label: '12:00' },
    { hour: 18, minute: 0, label: '18:00' },
    { hour: 21, minute: 0, label: '21:00' },
  ],
} as const;

/**
 * 通知渠道ID
 */
export const NOTIFICATION_CHANNEL_ID = 'redemption-code-expiry' as const;
