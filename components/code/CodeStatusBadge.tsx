import { View, Text, StyleSheet } from 'react-native';
import { RedemptionCodeStatus } from '@/types';
import { StatusColorMap } from '@/constants';

/**
 * 状态徽章属性
 */
interface CodeStatusBadgeProps {
  /** 状态值 */
  status: RedemptionCodeStatus;
}

/**
 * 获取状态文本
 */
function getStatusText(status: RedemptionCodeStatus): string {
  switch (status) {
    case RedemptionCodeStatus.ACTIVE:
      return '有效';
    case RedemptionCodeStatus.USED:
      return '已使用';
    case RedemptionCodeStatus.EXPIRED:
      return '已过期';
    default:
      return '未知';
  }
}

/**
 * 状态徽章组件
 */
export function CodeStatusBadge({ status }: CodeStatusBadgeProps) {
  const backgroundColor = StatusColorMap[status] || '#9E9E9E';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{getStatusText(status)}</Text>
    </View>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
