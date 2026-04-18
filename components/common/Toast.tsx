import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * Toast类型
 */
type ToastType = 'success' | 'error' | 'info';

/**
 * Toast组件属性
 */
interface ToastProps {
  /** 是否可见 */
  visible: boolean;
  /** 消息内容 */
  message: string;
  /** Toast类型 */
  type?: ToastType;
  /** 显示时长（毫秒） */
  duration?: number;
  /** 隐藏回调 */
  onHide: () => void;
}

/**
 * 获取Toast背景颜色
 */
function getBackgroundColor(type: ToastType): string {
  switch (type) {
    case 'success':
      return '#34C759';
    case 'error':
      return '#FF3B30';
    case 'info':
    default:
      return '#007AFF';
  }
}

/**
 * Toast提示组件
 * 使用现代化的样式和 boxShadow
 */
export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.toast,
          {
            backgroundColor: getBackgroundColor(type),
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          },
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    maxWidth: '80%',
    borderCurve: 'continuous',
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
