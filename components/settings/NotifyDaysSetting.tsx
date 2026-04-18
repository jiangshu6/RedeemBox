import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * 主题色 - 在深色和浅色模式下都使用蓝色
 */
const ACCENT_COLOR = '#0a7ea4';

/**
 * 通知天数设置属性
 */
interface NotifyDaysSettingProps {
  value: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}

/**
 * 通知天数设置组件
 * 使用现代化的样式
 */
export function NotifyDaysSetting({
  value,
  onChange,
  disabled = false,
}: NotifyDaysSettingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const presetDays = [1, 3, 7, 14, 30];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.icon }]}>
        默认提前通知天数
      </Text>
      <View style={styles.options}>
        {presetDays.map((days) => (
          <TouchableOpacity
            key={days}
            style={[
              styles.option,
              {
                backgroundColor:
                  value === days
                    ? ACCENT_COLOR
                    : colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.04)',
                boxShadow: value === days
                  ? '0 2px 8px rgba(0, 122, 255, 0.25)'
                  : 'none',
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            onPress={() => !disabled && onChange(days)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.optionText,
                { color: value === days ? '#fff' : colors.text },
              ]}
            >
              {days}天
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.hint, { color: colors.icon }]}>
        新建兑换码时默认使用此设置
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
