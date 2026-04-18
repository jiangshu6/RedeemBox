import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Button } from './Button';

/**
 * 确认对话框属性
 */
interface ConfirmDialogProps {
  /** 是否可见 */
  visible: boolean;
  /** 标题 */
  title: string;
  /** 消息内容 */
  message: string;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 确认按钮样式（危险操作显示红色） */
  danger?: boolean;
}

/**
 * 确认对话框组件
 * 使用现代化的样式和 boxShadow
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.icon }]}>
            {message}
          </Text>
          <View style={styles.buttons}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outlined"
              size="medium"
              style={styles.button}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant="filled"
              size="medium"
              style={danger ? [styles.button, { backgroundColor: '#F44336' }] : styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    borderCurve: 'continuous',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
