import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

/**
 * 搜索栏属性
 */
interface CodeSearchBarProps {
  onSearch: (keyword: string) => void;
  onClose: () => void;
  placeholder?: string;
  expanded: boolean;
}

/**
 * 搜索栏组件
 * 支持展开/收起动画，展开时显示搜索输入框
 */
export function CodeSearchBar({
  onSearch,
  onClose,
  placeholder = '搜索兑换码...',
  expanded,
}: CodeSearchBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [keyword, setKeyword] = useState('');
  const inputRef = useRef<TextInput>(null);
  const heightAnim = useRef(new Animated.Value(0)).current;

  // 监听展开状态变化，执行动画
  useEffect(() => {
    if (expanded) {
      // 展开时先清空上一次的内容
      setKeyword('');
      Animated.timing(heightAnim, {
        toValue: 64,
        duration: 250,
        useNativeDriver: false,
      }).start();
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      // 收起时先执行动画，动画结束后再清空
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setKeyword('');
          onSearch('');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const handleChangeText = useCallback((text: string) => {
    setKeyword(text);
    onSearch(text);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setKeyword('');
    onSearch('');
  }, [onSearch]);

  return (
    <View style={styles.outerWrapper}>
      <Animated.View style={[styles.wrapper, { height: heightAnim }]}>
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
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            value={keyword}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.icon}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {keyword.length > 0 ? (
            <TouchableOpacity onPress={handleClear} hitSlop={8}>
              <IconSymbol name="circle-xmark" size={20} color={colors.icon} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <IconSymbol name="xmark" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  outerWrapper: {
    paddingHorizontal: 16,
  },
  wrapper: {
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
    borderCurve: 'continuous',
    marginVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
});
