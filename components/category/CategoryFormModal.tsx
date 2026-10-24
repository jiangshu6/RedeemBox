import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { startOfDay } from 'date-fns';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { PRESET_COLORS } from '@/constants';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/ui.store';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/types';

const MODAL_HEIGHT = 500;

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
 * 优化了圆角、间距和颜色选择器样式
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
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 动画值
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const isEditing = !!category;

  // 处理显示/隐藏动画
  useEffect(() => {
    if (visible) {
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
        // 解析到期时间
        if (category.expireDate) {
          const date = new Date(category.expireDate);
          setYear(date.getFullYear().toString());
          setMonth((date.getMonth() + 1).toString());
          setDay(date.getDate().toString());
        } else {
          setYear('');
          setMonth('');
          setDay('');
        }
      } else {
        setName('');
        setSelectedColor(PRESET_COLORS[0]);
        setYear('');
        setMonth('');
        setDay('');
      }
    }
  }, [visible, category]);

  const handleSubmit = async () => {
    console.log('handleSubmit called', { name, year, month, day });
    
    if (!name.trim()) {
      console.log('name is empty');
      showToast('请输入类别名称', 'error');
      return;
    }

    // 验证日期输入
    let expireDate: number | null = null;
    if (year.trim() || month.trim() || day.trim()) {
      // 如果有任何一个字段有值，则所有字段都必须有值
      if (!year.trim() || !month.trim() || !day.trim()) {
        console.log('date fields incomplete');
        showToast('请填写完整的到期时间', 'error');
        return;
      }

      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const d = parseInt(day, 10);

      if (isNaN(y) || isNaN(m) || isNaN(d)) {
        console.log('date is NaN');
        showToast('日期格式不正确', 'error');
        return;
      }

      // 验证日期有效性
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        console.log('date is invalid');
        showToast('日期不合法', 'error');
        return;
      }

      expireDate = startOfDay(date).getTime();
      console.log('expireDate calculated:', expireDate);
    }

    setLoading(true);
    const data = { name: name.trim(), color: selectedColor, expireDate };
    console.log('submitting data:', data);
    const success = await onSubmit(data as CreateCategoryDTO | UpdateCategoryDTO);
    console.log('submit result:', success);
    setLoading(false);

    if (success) {
      onClose();
    } else {
      showToast(isEditing ? '更新失败，请重试' : '创建失败，请重试', 'error');
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

  const handleBackdropPress = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

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
        style={[styles.overlay, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      </Animated.View>

      {/* 内容区域 */}
      <Animated.View
        style={[
          styles.containerWrapper,
          { transform: [{ translateY }] },
        ]}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' },
          ]}
        >
          {/* 顶部指示条 */}
          <View style={styles.gripper}>
            <View style={[styles.gripperBar, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)' }]} />
          </View>

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
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5',
                  color: colors.text,
                  borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
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
                    selectedColor === color && [
                      styles.colorOptionSelected,
                      { shadowColor: color },
                    ],
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.7}
                >
                  {selectedColor === color && (
                    <View style={styles.checkmark} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.icon }]}>
              到期时间
            </Text>
            <View style={styles.dateInputRow}>
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
                value={year}
                onChangeText={setYear}
                placeholder="年"
                placeholderTextColor={colors.icon}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={[styles.dateSeparator, { color: colors.text }]}>年</Text>
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
                value={month}
                onChangeText={setMonth}
                placeholder="月"
                placeholderTextColor={colors.icon}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.dateSeparator, { color: colors.text }]}>月</Text>
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
                value={day}
                onChangeText={setDay}
                placeholder="日"
                placeholderTextColor={colors.icon}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.dateSeparator, { color: colors.text }]}>日</Text>
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
    paddingBottom: 36,
  },
  gripper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gripperBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    borderCurve: 'continuous',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  checkmark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    borderCurve: 'continuous',
  },
  dateSeparator: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
  },
});
