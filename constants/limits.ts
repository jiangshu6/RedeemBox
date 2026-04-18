/**
 * 长度限制常量
 */
export const Limits = {
  // 兑换码最大长度
  MAX_CODE_LENGTH: 256,
  // 备注最大长度
  MAX_DESCRIPTION_LENGTH: 500,
  // 类别名称最大长度
  MAX_CATEGORY_NAME_LENGTH: 50,
  // 通知内容最大长度
  MAX_NOTIFICATION_CONTENT_LENGTH: 200,
} as const;

/**
 * 默认类别颜色
 */
export const DEFAULT_CATEGORY_COLOR = '#2196F3' as const;

/**
 * 预设类别颜色列表
 */
export const PRESET_COLORS = [
  '#FF5722', // 深橙色
  '#2196F3', // 蓝色
  '#4CAF50', // 绿色
  '#FF9800', // 橙色
  '#9C27B0', // 紫色
  '#00BCD4', // 青色
  '#E91E63', // 粉色
  '#795548', // 棕色
] as const;
