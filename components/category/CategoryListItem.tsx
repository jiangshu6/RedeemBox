import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CategoryWithCount } from '@/types';
import { formatCodeCount } from '@/utils/formatters';

/**
 * 类别列表项属性
 */
interface CategoryListItemProps {
  category: CategoryWithCount;
  onPress: (category: CategoryWithCount) => void;
  onLongPress?: (category: CategoryWithCount) => void;
  selected?: boolean;
}

/**
 * 类别列表项组件
 * 使用现代化的卡片样式
 */
export function CategoryListItem({
  category,
  onPress,
  onLongPress,
  selected = false,
}: CategoryListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          boxShadow: selected
            ? `0 0 0 2px ${colors.tint}`
            : '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      ]}
      onPress={() => onPress(category)}
      onLongPress={() => onLongPress?.(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.colorDot, { backgroundColor: category.color }]} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={[styles.count, { color: colors.icon }]}>
          {formatCodeCount(category.codeCount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderCurve: 'continuous',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
    flex: 1,
  },
  count: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
});
