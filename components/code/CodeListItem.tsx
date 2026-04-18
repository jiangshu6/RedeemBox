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
 * 使用现代化的卡片样式
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      ]}
      onPress={() => onPress(code)}
      onLongPress={() => onLongPress?.(code)}
      activeOpacity={0.7}
    >
      {/* 状态徽章 */}
      <View style={styles.header}>
        <CodeStatusBadge status={code.status} />
        {categoryName && (
          <View style={[styles.categoryTag, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.categoryText, { color: colors.icon }]}>
              {categoryName}
            </Text>
          </View>
        )}
      </View>

      {/* 兑换码内容 */}
      <Text style={[styles.code, { color: colors.text }]} numberOfLines={2}>
        {maskCode(code.code, 8)}
      </Text>

      {/* 备注和到期时间 */}
      <View style={styles.footer}>
        {code.description && (
          <Text style={[styles.description, { color: colors.icon }]} numberOfLines={1}>
            {code.description}
          </Text>
        )}
        {code.expireDate && (
          <Text
            style={[
              styles.expireDate,
              { color: expired ? '#F44336' : colors.icon },
            ]}
          >
            {expired ? '已过期' : `${daysUntilExpire}天后到期`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderCurve: 'continuous',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  code: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  expireDate: {
    fontSize: 13,
    fontWeight: '500',
  },
});
