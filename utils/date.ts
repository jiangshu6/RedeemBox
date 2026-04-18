import { format, isAfter, isBefore, startOfDay, endOfDay, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期显示
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: number | null): string {
  if (!timestamp) return '-';
  return format(new Date(timestamp), 'yyyy年MM月dd日', { locale: zhCN });
}

/**
 * 格式化日期时间显示
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(timestamp: number | null): string {
  if (!timestamp) return '-';
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

/**
 * 格式化简短日期
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的简短日期字符串
 */
export function formatShortDate(timestamp: number | null): string {
  if (!timestamp) return '-';
  return format(new Date(timestamp), 'MM月dd日', { locale: zhCN });
}

/**
 * 格式化到期日期（含过期状态）
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的到期日期字符串
 */
export function formatExpireDate(timestamp: number | null): string {
  if (!timestamp) return '永久有效';
  const date = new Date(timestamp);
  if (isBefore(endOfDay(date), new Date())) {
    return `已过期 (${format(date, 'yyyy-MM-dd', { locale: zhCN })})`;
  }
  return format(date, 'yyyy-MM-dd', { locale: zhCN });
}

/**
 * 判断是否已过期
 * @param timestamp 时间戳（毫秒）
 * @returns 是否已过期
 */
export function isExpired(timestamp: number | null): boolean {
  if (!timestamp) return false;
  return isBefore(endOfDay(new Date(timestamp)), new Date());
}

/**
 * 计算距离到期天数
 * @param timestamp 时间戳（毫秒）
 * @returns 距离到期的天数，负数表示已过期，null表示永久有效
 */
export function getDaysUntilExpire(timestamp: number | null): number | null {
  if (!timestamp) return null;
  const today = startOfDay(new Date());
  const expireDate = startOfDay(new Date(timestamp));
  return differenceInDays(expireDate, today);
}

/**
 * 判断是否即将到期
 * @param timestamp 时间戳（毫秒）
 * @param days 提前天数
 * @returns 是否即将到期
 */
export function isExpiringSoon(timestamp: number | null, days: number): boolean {
  if (!timestamp) return false;
  const daysUntilExpire = getDaysUntilExpire(timestamp);
  if (daysUntilExpire === null) return false;
  return daysUntilExpire >= 0 && daysUntilExpire <= days;
}

/**
 * 判断是否本月到期
 * @param timestamp 时间戳（毫秒）
 * @returns 是否本月到期
 */
export function isExpiringThisMonth(timestamp: number | null): boolean {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const today = new Date();
  return !isBefore(date, startOfMonth(today)) && !isAfter(date, endOfMonth(today));
}

/**
 * 获取今日开始时间戳
 * @returns 今日开始时间戳（毫秒）
 */
export function getTodayStartTimestamp(): number {
  return startOfDay(new Date()).getTime();
}

/**
 * 获取今日结束时间戳
 * @returns 今日结束时间戳（毫秒）
 */
export function getTodayEndTimestamp(): number {
  return endOfDay(new Date()).getTime();
}
