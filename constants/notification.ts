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
  // 每日检查时间（小时）
  NOTIFY_CHECK_HOUR: 9,
} as const;

/**
 * 通知渠道ID
 */
export const NOTIFICATION_CHANNEL_ID = 'redemption-code-expiry' as const;
