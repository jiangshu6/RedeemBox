import { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * 按钮变体类型
 */
type ButtonVariant = 'filled' | 'outlined' | 'text';

/**
 * 按钮尺寸类型
 */
type ButtonSize = 'small' | 'medium' | 'large';

/**
 * 按钮组件属性
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * 主题色 - 在深色和浅色模式下都使用蓝色
 */
const ACCENT_COLOR = '#0a7ea4';

/**
 * 通用按钮组件
 * 使用现代化的样式和 boxShadow
 */
export function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...sizeStyles[size],
      borderCurve: 'continuous',
    };

    if (variant === 'filled') {
      return {
        ...baseStyle,
        backgroundColor: disabled ? colors.border : ACCENT_COLOR,
        boxShadow: disabled
          ? 'none'
          : '0 2px 8px rgba(0, 122, 255, 0.25)',
      };
    }

    if (variant === 'outlined') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? colors.border : ACCENT_COLOR,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: 'transparent',
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
      ...textSizeStyles[size],
    };

    if (variant === 'filled') {
      return {
        ...baseTextStyle,
        color: '#fff',
      };
    }

    return {
      ...baseTextStyle,
      color: disabled ? colors.border : ACCENT_COLOR,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? '#fff' : ACCENT_COLOR}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

/**
 * 基础样式
 */
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
});

/**
 * 尺寸样式
 */
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: 10,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    borderRadius: 12,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 54,
    borderRadius: 14,
  },
};

/**
 * 文本尺寸样式
 */
const textSizeStyles: Record<ButtonSize, TextStyle> = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 17,
  },
};
