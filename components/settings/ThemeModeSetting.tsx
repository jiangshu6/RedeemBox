import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemeMode } from '@/types';
import { IconSymbol, IconName } from '@/components/ui/icon-symbol';

/**
 * 主题色 - 在深色和浅色模式下都使用蓝色
 */
const ACCENT_COLOR = '#0a7ea4';

/**
 * 主题模式设置属性
 */
interface ThemeModeSettingProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

/**
 * 主题模式选项
 */
const themeOptions: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'light', label: '浅色', icon: 'sun' },
  { mode: 'dark', label: '深色', icon: 'moon' },
  { mode: 'system', label: '跟随系统', icon: 'gear' },
];

/**
 * 主题模式设置组件
 * 使用现代化的卡片样式
 */
export function ThemeModeSetting({ value, onChange }: ThemeModeSettingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.icon }]}>主题模式</Text>
      <View style={styles.options}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              {
                backgroundColor:
                  value === option.mode
                    ? ACCENT_COLOR
                    : colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.04)',
                boxShadow: value === option.mode
                  ? '0 2px 8px rgba(0, 122, 255, 0.25)'
                  : 'none',
              },
            ]}
            onPress={() => onChange(option.mode)}
          >
            <IconSymbol
              name={option.icon}
              size={22}
              color={value === option.mode ? '#fff' : colors.text}
            />
            <Text
              style={[
                styles.optionText,
                { color: value === option.mode ? '#fff' : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    gap: 10,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderCurve: 'continuous',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
