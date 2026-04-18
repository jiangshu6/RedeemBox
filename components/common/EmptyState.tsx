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
      {icon && <View style={styles.iconContainer}>{icon}</View>}
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
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    minWidth: 140,
  },
});
