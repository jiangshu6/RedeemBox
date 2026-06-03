import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Button } from './Button';

/**
 * 空状态组件属性
 */
interface EmptyStateProps {
  /** 标题 */
  title: string;
  /** 描述文字 */
  description?: string;
  /** 操作按钮文本 */
  actionText?: string;
  /** 操作按钮回调 */
  onAction?: () => void;
  /** 自定义图标 */
  icon?: React.ReactNode;
}

/**
 * 空状态组件
 * 优化了视觉层次和间距
 */
export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {/* 图标容器 */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colorScheme === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.04)',
            },
          ]}
        >
          {icon}
        </View>
      )}
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: colors.icon }]}>
          {description}
        </Text>
      )}
      {actionText && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          variant="filled"
          size="medium"
          style={styles.button}
        />
      )}
    </View>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  iconContainer: {
    marginBottom: 16,
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    minWidth: 160,
  },
});
