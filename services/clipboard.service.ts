import * as Clipboard from 'expo-clipboard';

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/**
 * 从剪贴板获取文本
 * @returns 剪贴板中的文本，如果没有则返回 null
 */
export async function getFromClipboard(): Promise<string | null> {
  const hasString = await Clipboard.hasStringAsync();
  if (!hasString) {
    return null;
  }
  return Clipboard.getStringAsync();
}

/**
 * 剪贴板服务
 */
export const ClipboardService = {
  /**
   * 复制文本
   */
  async copy(text: string): Promise<boolean> {
    try {
      await copyToClipboard(text);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  },

  /**
   * 获取剪贴板内容
   */
  async paste(): Promise<string | null> {
    try {
      return getFromClipboard();
    } catch (error) {
      console.error('粘贴失败:', error);
      return null;
    }
  },

  /**
   * 检查剪贴板是否有内容
   */
  async hasContent(): Promise<boolean> {
    return Clipboard.hasStringAsync();
  },
};
