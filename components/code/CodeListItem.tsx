import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { RedemptionCode } from '@/types';
import { CodeStatusBadge } from './CodeStatusBadge';
import { getDaysUntilExpire, isExpired } from '@/utils/date';
import { maskCode } from '@/utils/formatters';

/**
 * 兑换码列表项属性
 */
interface CodeListItemProps {
  code: RedemptionCode;
  categoryName?: string;
  onPress: (code: RedemptionCode) => void;
  onLongPress?: (code: RedemptionCode) => void;
}

/**
 * 兑换码列表项组件
 * 使用现代化的卡片样式，优化信息层级和视觉间距
 */
export function CodeListItem({
  code,
  categoryName,
  onPress,
  onLongPress,
}: CodeListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const daysUntilExpire = getDaysUntilExpire(code.expireDate);
  const expired = isExpired(code.expireDate);

  // 获取类别颜色（用于左边框装饰）
  const categoryColor = categoryName
    ? colors.border
    : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
          borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)',
          shadowColor: colorScheme === 'dark' ? 'transparent' : 'rgba(0,0,0,0.08)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: colorScheme === 'dark' ? 0 : 2,
        },
      ]}
      onPress={() => onPress(code)}
      onLongPress={() => onLongPress?.(code)}
      activeOpacity={0.7}
    >
      {/* 左侧装饰条 - 类别颜色 */}
      <View style={[styles.categoryStrip, { backgroundColor: categoryColor }]} />

      {/* 卡片内容 */}
      <View style={styles.content}>
        {/* 状态行 */}
        <View style={styles.header}>
          <CodeStatusBadge status={code.status} />
          {categoryName && (
            <View style={styles.categoryBadge}>
              <Text style={[styles.categoryText, { color: colors.icon }]}>
                {categoryName}
              </Text>
            </View>
          )}
        </View>

        {/* 兑换码内容 */}
        <Text
          selectable
          style={[styles.code, { color: colors.text }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {maskCode(code.code, 8)}
        </Text>

        {/* 备注和到期时间 */}
        <View style={styles.footer}>
          {code.description ? (
            <Text
              selectable
              style={[styles.description, { color: colors.icon }]}
              numberOfLines={1}
            >
              {code.description}
            </Text>
          ) : (
            <View style={styles.flex} />
          )}
          {code.expireDate && (
            <Text
              style={[
                styles.expireDate,
                { color: expired ? '#E53935' : colors.icon },
              ]}
            >
              {expired ? '已过期' : `${daysUntilExpire}天后到期`}
            </Text>
          )}
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
  categoryStrip: {
    width: 3,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  code: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
    fontFamily: 'ui-monospace',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  description: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  expireDate: {
    fontSize: 12,
    fontWeight: '500',
  },
});
