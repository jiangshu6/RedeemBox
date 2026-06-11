import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

/**
 * 工具栏属性
 */
interface ToolbarProps {
  /** 标题 */
  title: string;
  /** 右侧按钮（可选） */
  rightButton?: React.ReactNode;
}

/**
 * 通用工具栏组件
 * 包含标题、可选的右侧按钮和底部分割线
 */
export function Toolbar({ title, rightButton }: ToolbarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const dividerColor = colorScheme === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.06)';

  return (
    <>
      <View style={[styles.toolbar, { paddingTop: insets.top + 4 }]}>
        {rightButton ? (
          <View style={styles.toolbarContent}>
            <View style={styles.toolbarTitlePlaceholder} />
            <ThemedText type="title" style={styles.toolbarTitle}>{title}</ThemedText>
            {rightButton}
          </View>
        ) : (
          <ThemedText type="title" style={styles.toolbarTitleCentered}>{title}</ThemedText>
        )}
      </View>
      <View style={[styles.toolbarDivider, { backgroundColor: dividerColor }]} />
    </>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarTitlePlaceholder: {
    width: 26,
  },
  toolbarTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  toolbarTitleCentered: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  toolbarDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
