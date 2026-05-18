import { useEffect, useCallback, useRef } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { NotificationService, requestNotificationPermission } from '@/services/notification.service';
import { useSettingsStore } from '@/store/settings.store';
import { isDatabaseInitialized } from '@/services/database.service';

/**
 * 通知Hook
 */
export function useNotification(dbReady: boolean = true) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const { notifyEnabled, loadSettings } = useSettingsStore();

  /**
   * 初始化通知服务
   */
  const initialize = useCallback(async () => {
    // 检查数据库是否已初始化
    if (!isDatabaseInitialized()) {
      console.log('数据库未初始化，跳过通知初始化');
      return;
    }

    // 加载设置
    await loadSettings();

    // 请求通知权限
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('通知权限未授予');
      return;
    }

    // 初始化通知服务
    await NotificationService.initialize();

    // 设置通知接收监听器
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('收到通知:', notification);
      }
    );

    // 设置通知点击监听器
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const codeId = await NotificationService.handleNotificationClick(
          response.notification
        );
        if (codeId) {
          // 跳转到兑换码详情页
          router.push(`/code/${codeId}`);
        }
      }
    );
  }, [loadSettings]);

  /**
   * 清理监听器
   */
  const cleanup = useCallback(() => {
    if (notificationListener.current) {
      notificationListener.current.remove();
    }
    if (responseListener.current) {
      responseListener.current.remove();
    }
  }, []);

  /**
   * 手动检查并发送通知
   */
  const checkAndNotify = useCallback(async () => {
    if (!notifyEnabled) return 0;
    return NotificationService.checkAndNotify();
  }, [notifyEnabled]);

  useEffect(() => {
    // 只有在数据库准备好后才初始化
    if (dbReady) {
      initialize();
    }
    return cleanup;
  }, [dbReady, initialize, cleanup]);

  return {
    initialize,
    cleanup,
    checkAndNotify,
  };
}
