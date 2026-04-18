import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { useUIStore } from '@/store/ui.store';
import { ThemeMode } from '@/types';
import { NotificationConstants } from '@/constants';

/**
 * 设置管理Hook
 */
export function useSettings() {
  const {
    notifyEnabled,
    defaultNotifyDays,
    themeMode,
    loading,
    error,
    loadSettings,
    setNotifyEnabled,
    setDefaultNotifyDays,
    setThemeMode,
    resetToDefaults,
    clearError,
  } = useSettingsStore();

  const { showToast, showConfirm, hideConfirm } = useUIStore();

  /**
   * 切换通知开关
   */
  const toggleNotifyEnabled = useCallback(async () => {
    const newValue = !notifyEnabled;
    const success = await setNotifyEnabled(newValue);
    if (success) {
      showToast(
        newValue ? '通知已开启' : '通知已关闭',
        'success'
      );
    } else {
      showToast('设置失败', 'error');
    }
    return success;
  }, [notifyEnabled, setNotifyEnabled, showToast]);

  /**
   * 更新默认通知天数
   */
  const updateDefaultNotifyDays = useCallback(async (days: number) => {
    if (days < NotificationConstants.MIN_NOTIFY_DAYS || days > NotificationConstants.MAX_NOTIFY_DAYS) {
      showToast(`天数必须在 ${NotificationConstants.MIN_NOTIFY_DAYS}-${NotificationConstants.MAX_NOTIFY_DAYS} 之间`, 'error');
      return false;
    }
    const success = await setDefaultNotifyDays(days);
    if (success) {
      showToast('设置已保存', 'success');
    } else {
      showToast('设置失败', 'error');
    }
    return success;
  }, [setDefaultNotifyDays, showToast]);

  /**
   * 更新主题模式
   */
  const updateThemeMode = useCallback(async (mode: ThemeMode) => {
    const success = await setThemeMode(mode);
    if (success) {
      const modeText = {
        light: '浅色模式',
        dark: '深色模式',
        system: '跟随系统',
      };
      showToast(`已切换到${modeText[mode]}`, 'success');
    } else {
      showToast('设置失败', 'error');
    }
    return success;
  }, [setThemeMode, showToast]);

  /**
   * 重置所有设置
   */
  const handleResetToDefaults = useCallback(async () => {
    return new Promise<boolean>((resolve) => {
      showConfirm({
        title: '重置设置',
        message: '确定要将所有设置恢复为默认值吗？',
        confirmText: '重置',
        cancelText: '取消',
        onConfirm: async () => {
          hideConfirm();
          const success = await resetToDefaults();
          if (success) {
            showToast('设置已重置', 'success');
            resolve(true);
          } else {
            showToast('重置失败', 'error');
            resolve(false);
          }
        },
        onCancel: () => {
          hideConfirm();
          resolve(false);
        },
      });
    });
  }, [resetToDefaults, showConfirm, hideConfirm, showToast]);

  return {
    notifyEnabled,
    defaultNotifyDays,
    themeMode,
    loading,
    error,
    loadSettings,
    toggleNotifyEnabled,
    updateDefaultNotifyDays,
    updateThemeMode,
    resetToDefaults: handleResetToDefaults,
    clearError,
    // 常量
    minNotifyDays: NotificationConstants.MIN_NOTIFY_DAYS,
    maxNotifyDays: NotificationConstants.MAX_NOTIFY_DAYS,
  };
}
