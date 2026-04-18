import { type StyleProp, type ViewStyle } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

/**
 * 图标名称类型
 * 映射到 FontAwesome6 图标
 */
export type IconName =
  // Tab 图标
  | 'ticket'
  | 'folder'
  | 'gear'
  // 导航图标
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  // 操作图标
  | 'plus'
  | 'minus'
  | 'xmark'
  | 'check'
  | 'pen'
  | 'trash'
  | 'share'
  | 'copy'
  // 状态图标
  | 'circle-check'
  | 'circle-xmark'
  | 'triangle-exclamation'
  | 'circle-info'
  // 功能图标
  | 'magnifying-glass'
  | 'bell'
  | 'bell-slash'
  | 'clock'
  | 'calendar'
  | 'sun'
  | 'moon'
  | 'rotate-left'
  | 'house'
  | 'paper-plane'
  | 'list'
  | 'filter';

/**
 * 图标名称映射
 * 将内部名称映射到 FontAwesome6 图标名称
 */
const iconNameMap: Record<IconName, string> = {
  // Tab 图标
  'ticket': 'ticket',
  'folder': 'folder',
  'gear': 'gear',
  // 导航图标
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  // 操作图标
  'plus': 'plus',
  'minus': 'minus',
  'xmark': 'xmark',
  'check': 'check',
  'pen': 'pen',
  'trash': 'trash',
  'share': 'share-from-square',
  'copy': 'copy',
  // 状态图标
  'circle-check': 'circle-check',
  'circle-xmark': 'circle-xmark',
  'triangle-exclamation': 'triangle-exclamation',
  'circle-info': 'circle-info',
  // 功能图标
  'magnifying-glass': 'magnifying-glass',
  'bell': 'bell',
  'bell-slash': 'bell-slash',
  'clock': 'clock',
  'calendar': 'calendar-days',
  'sun': 'sun',
  'moon': 'moon',
  'rotate-left': 'rotate-left',
  'house': 'house',
  'paper-plane': 'paper-plane',
  'list': 'list',
  'filter': 'filter',
};

/**
 * 图标组件
 * 使用 @expo/vector-icons 的 FontAwesome6 图标
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  const faName = iconNameMap[name] || name;
  return (
    <FontAwesome6
      name={faName}
      size={size}
      color={color}
      style={style}
    />
  );
}
