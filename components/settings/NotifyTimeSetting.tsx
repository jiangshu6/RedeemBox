import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { NotifyTime } from '@/types';
import { NotificationConstants } from '@/constants';

/**
 * 主题色 - 在深色和浅色模式下都使用蓝色
 */
const ACCENT_COLOR = '#0a7ea4';

/**
 * 通知时间设置属性
 */
interface NotifyTimeSettingProps {
  value: NotifyTime;
  onChange: (time: NotifyTime) => void;
  disabled?: boolean;
}

/**
 * 检查两个时间是否相同
 */
function isSameTime(a: NotifyTime, b: NotifyTime): boolean {
  return a.hour === b.hour && a.minute === b.minute;
}

/**
 * 通知时间设置组件
 * 使用现代化的样式
 */
export function NotifyTimeSetting({
  value,
  onChange,
  disabled = false,
}: NotifyTimeSettingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // 使用预设时间选项
  const presetTimes = NotificationConstants.PRESET_NOTIFY_TIMES;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.icon }]}>
        每日通知时间
      </Text>
      <View style={styles.options}>
        {presetTimes.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={[
              styles.option,
              {
                backgroundColor:
                  isSameTime(value, { hour: preset.hour, minute: preset.minute })
                    ? ACCENT_COLOR
                    : colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.04)',
                boxShadow: isSameTime(value, { hour: preset.hour, minute: preset.minute })
                  ? '0 2px 8px rgba(0, 122, 255, 0.25)'
                  : 'none',
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            onPress={() => !disabled && onChange({ hour: preset.hour, minute: preset.minute })}
            disabled={disabled}
          >
            <Text
              style={[
                styles.optionText,
                { color: isSameTime(value, { hour: preset.hour, minute: preset.minute }) ? '#fff' : colors.text },
              ]}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.hint, { color: colors.icon }]}>
        每天在设定时间检查即将到期的兑换码
      </Text>
    </View>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 64,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    marginTop: 10,
  },
});
