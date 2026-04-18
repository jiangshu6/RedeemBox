import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { PRESET_COLORS } from '@/constants';
import { Button } from '@/components/common/Button';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/types';

const MODAL_HEIGHT = 420;

/**
 * 类别表单弹窗属性
 */
interface CategoryFormModalProps {
  /** 是否可见 */
  visible: boolean;
  /** 编辑的类别（为空则新建） */
  category?: Category | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 提交回调 */
  onSubmit: (data: CreateCategoryDTO | UpdateCategoryDTO) => Promise<boolean>;
  /** 删除回调（仅编辑模式） */
  onDelete?: () => Promise<boolean>;
}

/**
 * 类别表单弹窗组件
 */
export function CategoryFormModal({
  visible,
  category,
  onClose,
  onSubmit,
  onDelete,
}: CategoryFormModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 动画值
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const isEditing = !!category;

  // 处理显示/隐藏动画
  useEffect(() => {
    if (visible) {
      // 显示动画：遮罩层淡入 + 内容从底部弹出
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 隐藏动画
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: MODAL_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (category) {
        setName(category.name);
        setSelectedColor(category.color);
      } else {
        setName('');
        setSelectedColor(PRESET_COLORS[0]);
      }
    }
  }, [visible, category]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    const data = isEditing
      ? { name: name.trim(), color: selectedColor }
      : { name: name.trim(), color: selectedColor };
    
    const success = await onSubmit(data as CreateCategoryDTO | UpdateCategoryDTO);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    const success = await onDelete();
    setDeleting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* 遮罩层 */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: backdropOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* 内容区域 */}
      <Animated.View
        style={[
          styles.containerWrapper,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {isEditing ? '编辑类别' : '新建类别'}
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.icon }]}>
              类别名称
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="请输入类别名称"
              placeholderTextColor={colors.icon}
              maxLength={50}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.icon }]}>
              选择颜色
            </Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          <View style={styles.buttons}>
            {isEditing && onDelete && (
              <Button
                title="删除"
                onPress={handleDelete}
                variant="text"
                size="medium"
                loading={deleting}
                textStyle={{ color: '#F44336' }}
                style={styles.button}
              />
            )}
            <Button
              title="取消"
              onPress={onClose}
              variant="outlined"
              size="medium"
              style={styles.button}
            />
            <Button
              title={isEditing ? '保存' : '创建'}
              onPress={handleSubmit}
              variant="filled"
              size="medium"
              loading={loading}
              disabled={!name.trim()}
              style={styles.button}
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  containerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
