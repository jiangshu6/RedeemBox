/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * 部分隐藏兑换码（用于列表显示）
 * @param code 兑换码内容
 * @param visibleChars 可见字符数（前后各显示的字符数）
 * @returns 隐藏后的兑换码
 */
export function maskCode(code: string, visibleChars: number = 4): string {
  if (!code) return '';
  if (code.length <= visibleChars * 2) return code;
  const start = code.slice(0, visibleChars);
  const end = code.slice(-visibleChars);
  const maskedLength = Math.min(code.length - visibleChars * 2, 8);
  const masked = '*'.repeat(maskedLength);
  return `${start}${masked}${end}`;
}

/**
 * 格式化状态文本
 * @param status 状态值
 * @returns 状态文本
 */
export function formatStatus(status: number): string {
  const statusMap: Record<number, string> = {
    0: '有效',
    1: '已使用',
    2: '已过期',
  };
  return statusMap[status] ?? '未知';
}

/**
 * 格式化兑换码数量
 * @param count 数量
 * @returns 格式化后的数量文本
 */
export function formatCodeCount(count: number): string {
  return `${count} 个兑换码`;
}
