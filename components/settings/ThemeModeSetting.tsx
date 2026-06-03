import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemeMode } from '@/types';

const THEME_MODES: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: '跟随系统' },
  { mode: 'light', label: '浅色' },
  { mode: 'dark', label: '深色' },
];

/**
 * 主题模式设置属性
 */
interface ThemeModeSettingProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

/**
 * 主题模式设置组件
 * 行内切换模式，使用分段控件
 */
export function ThemeModeSetting({
  value,
  onChange,
}: ThemeModeSettingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const currentLabel = THEME_MODES.find(m => m.mode === value)?.label || '跟随系统';

  return (
    <View style={styles.row}>
      <View style={styles.settingLeft}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          主题模式
        </Text>
        <Text style={[styles.settingDesc, { color: colors.icon }]}>
          当前{currentLabel}
        </Text>
      </View>
      <View style={[styles.segmentedControl, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        {THEME_MODES.map((item) => {
          const isActive = value === item.mode;
          return (
            <TouchableOpacity
              key={item.mode}
              style={[
                styles.segmentButton,
                isActive && [
                  styles.segmentButtonActive,
                  { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : '#fff' },
                ],
              ]}
              onPress={() => onChange(item.mode)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: isActive ? colors.text : colors.icon },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  settingLeft: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 13,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
