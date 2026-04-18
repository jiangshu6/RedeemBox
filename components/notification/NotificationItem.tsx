import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { NotificationRecordWithCode, NotificationStatus } from '@/types';
import { formatDateTime } from '@/utils/date';

/**
 * 通知记录项属性
 */
interface NotificationItemProps {
  /** 通知记录 */
  record: NotificationRecordWithCode;
  /** 点击回调 */
  onPress: (record: NotificationRecordWithCode) => void;
}

/**
 * 获取状态文本
 */
function getStatusText(status: NotificationStatus): string {
  switch (status) {
    case NotificationStatus.SENT:
      return '未读';
    case NotificationStatus.READ:
      return '已读';
    case NotificationStatus.CLICKED:
      return '已点击';
    default:
      return '未知';
  }
}

/**
 * 获取状态颜色
 */
function getStatusColor(status: NotificationStatus): string {
  switch (status) {
    case NotificationStatus.SENT:
      return '#FF9800';
    case NotificationStatus.READ:
      return '#2196F3';
    case NotificationStatus.CLICKED:
      return '#4CAF50';
    default:
      return '#9E9E9E';
  }
}

/**
 * 通知记录项组件
 */
export function NotificationItem({ record, onPress }: NotificationItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(record)}
      activeOpacity={0.7}
    >
      {/* 左侧内容 */}
      <View style={styles.content}>
        <Text
          style={[
            styles.code,
            { color: colors.text },
          ]}
          numberOfLines={1}
        >
          {record.code}
        </Text>
        <Text
          style={[
            styles.message,
            { color: colors.icon },
          ]}
          numberOfLines={2}
        >
          {record.content}
        </Text>
        <Text style={[styles.time, { color: colors.icon }]}>
          {formatDateTime(record.notifiedAt)}
        </Text>
      </View>

      {/* 右侧状态 */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
        <Text style={styles.statusText}>{getStatusText(record.status)}</Text>
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
