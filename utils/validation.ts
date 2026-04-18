import { Limits, NotificationConstants } from '@/constants';

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * 验证兑换码内容
 * @param code 兑换码内容
 * @returns 验证结果
 */
export function validateCode(code: string): ValidationResult {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: '兑换码内容不能为空' };
  }
  if (code.length > Limits.MAX_CODE_LENGTH) {
    return { valid: false, message: `兑换码内容不能超过${Limits.MAX_CODE_LENGTH}个字符` };
  }
  return { valid: true };
}

/**
 * 验证类别名称
 * @param name 类别名称
 * @returns 验证结果
 */
export function validateCategoryName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: '类别名称不能为空' };
  }
  if (name.length > Limits.MAX_CATEGORY_NAME_LENGTH) {
    return { valid: false, message: `类别名称不能超过${Limits.MAX_CATEGORY_NAME_LENGTH}个字符` };
  }
  return { valid: true };
}

/**
 * 验证通知天数
 * @param days 通知天数
 * @returns 验证结果
 */
export function validateNotifyDays(days: number): ValidationResult {
  if (days < NotificationConstants.MIN_NOTIFY_DAYS || days > NotificationConstants.MAX_NOTIFY_DAYS) {
    return {
      valid: false,
      message: `通知天数必须在${NotificationConstants.MIN_NOTIFY_DAYS}-${NotificationConstants.MAX_NOTIFY_DAYS}之间`,
    };
  }
  return { valid: true };
}

/**
 * 验证备注长度
 * @param description 备注内容
 * @returns 验证结果
 */
export function validateDescription(description: string): ValidationResult {
  if (description && description.length > Limits.MAX_DESCRIPTION_LENGTH) {
    return { valid: false, message: `备注不能超过${Limits.MAX_DESCRIPTION_LENGTH}个字符` };
  }
  return { valid: true };
}

/**
 * 验证颜色格式
 * @param color 颜色值
 * @returns 验证结果
 */
export function validateColor(color: string): ValidationResult {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  if (!hexPattern.test(color)) {
    return { valid: false, message: '颜色格式无效，请使用十六进制格式（如 #FF5722）' };
  }
  return { valid: true };
}
