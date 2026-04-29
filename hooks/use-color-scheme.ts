import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settings.store';

/**
 * 自定义颜色方案 Hook
 * 根据用户设置的主题模式返回正确的颜色方案
 * - 'light': 强制浅色模式
 * - 'dark': 强制深色模式
 * - 'system': 跟随系统设置
 */
export function useColorScheme(): 'light' | 'dark' {
  // 获取系统的颜色方案
  const systemColorScheme = useNativeColorScheme();
  
  // 获取用户设置的主题模式
  const themeMode = useSettingsStore((state) => state.themeMode);
  
  // 根据用户设置返回对应的颜色方案
  if (themeMode === 'light') {
    return 'light';
  }
  
  if (themeMode === 'dark') {
    return 'dark';
  }
  
  // 跟随系统
  return systemColorScheme ?? 'light';
}
