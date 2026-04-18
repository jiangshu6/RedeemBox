import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * 加载指示器属性
 */
interface LoadingProps {
  /** 是否显示 */
  visible: boolean;
  /** 加载提示文字 */
  text?: string;
  /** 是否全屏遮罩 */
  fullScreen?: boolean;
}

/**
 * 加载指示器组件
 */
export function Loading({
  visible,
  text,
  fullScreen = false,
}: LoadingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!visible) return null;

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        fullScreen && styles.fullScreen,
      ]}
    >
      <ActivityIndicator size="large" color={colors.tint} />
      {text && (
        <Text style={[styles.text, { color: colors.text }]}>
          {text}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>{content}</View>
      </Modal>
    );
  }

  return content;
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fullScreen: {
    minWidth: 100,
    minHeight: 100,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
