import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CategoryWithCount } from '@/types';
import { formatCodeCount } from '@/utils/formatters';
import { formatDate } from '@/utils/date';

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
 * 使用现代化的卡片样式，与兑换码卡片保持一致
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
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
          borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
      ]}
      onPress={() => onPress(category)}
      onLongPress={() => onLongPress?.(category)}
      activeOpacity={0.7}
    >
      {/* 左侧颜色条 */}
      <View style={[styles.colorStrip, { backgroundColor: category.color }]} />

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            selectable
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {category.name}
          </Text>
          <Text style={[styles.expireDate, { color: colors.icon }]}>
            到期：{formatDate(category.expireDate)}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: colors.icon }]}>
            {formatCodeCount(category.codeCount)}
          </Text>
        </View>
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
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  colorStrip: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  expireDate: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
