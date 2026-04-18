/**
 * 状态枚举值映射
 * 用于状态数值与文本的转换
 */
export const RedemptionCodeStatusMap = {
  0: '有效',
  1: '已使用',
  2: '已过期',
} as const;

export const NotificationStatusMap = {
  0: '已发送',
  1: '已读',
  2: '已点击',
} as const;

/**
 * 状态颜色映射
 */
export const StatusColorMap = {
  0: '#4CAF50', // ACTIVE - 绿色
  1: '#9E9E9E', // USED - 灰色
  2: '#F44336', // EXPIRED - 红色
} as const;
