import { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

/**
 * 搜索栏属性
 */
interface CodeSearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
}

/**
 * 搜索栏组件
 * 使用现代化的样式
 */
export function CodeSearchBar({
  onSearch,
  placeholder = '搜索兑换码...',
}: CodeSearchBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [keyword, setKeyword] = useState('');

  const handleChangeText = useCallback((text: string) => {
    setKeyword(text);
    onSearch(text);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setKeyword('');
    onSearch('');
  }, [onSearch]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        },
      ]}
    >
      <IconSymbol name="magnifying-glass" size={20} color={colors.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={keyword}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {keyword.length > 0 && (
        <TouchableOpacity onPress={handleClear}>
          <IconSymbol name="circle-xmark" size={20} color={colors.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
    borderCurve: 'continuous',
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
});
