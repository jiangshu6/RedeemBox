import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { DatePicker } from '@ant-design/react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Category } from '@/types';
import { formatDate } from '@/utils/date';

/**
 * 主题色 - 在深色和浅色模式下都使用蓝色
 */
const ACCENT_COLOR = '#0a7ea4';

/**
 * 表单数据
 */
interface CodeFormData {
  code: string;
  categoryId: number | null;
  description: string;
  expireDate: Date | null;
  notifyDays: number;
  isNotifyEnabled: boolean;
}

/**
 * 表单错误
 */
interface FormErrors {
  code?: string;
  description?: string;
  notifyDays?: string;
}

/**
 * 兑换码表单属性
 */
interface CodeFormProps {
  /** 表单数据 */
  formData: CodeFormData;
  /** 表单错误 */
  errors: FormErrors;
  /** 类别列表 */
  categories: Category[];
  /** 是否加载中 */
  loading: boolean;
  /** 是否编辑模式 */
  isEditing?: boolean;
  /** 是否显示底部按钮（默认 true） */
  showButtons?: boolean;
  /** 内容容器样式 */
  contentContainerStyle?: any;
  /** 字段更新回调 */
  updateField: <K extends keyof CodeFormData>(field: K, value: CodeFormData[K]) => void;
  /** 提交回调 */
  onSubmit: () => Promise<boolean>;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 兑换码表单组件
 * 使用现代化的输入框样式
 */
export function CodeForm({
  formData,
  errors,
  categories,
  loading,
  isEditing = false,
  showButtons = true,
  contentContainerStyle,
  updateField,
  onSubmit,
  onCancel,
}: CodeFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  // 可选的提醒天数选项
  const notifyDaysOptions = [1, 3, 7, 14, 30];

  // 预设天数选项
  const presetDays = [7, 30, 90, 180, 365];

  // 判断是否是自定义日期（不是永久有效，也不是预设天数）
  const isCustomDate = formData.expireDate !== null && (() => {
    for (const days of presetDays) {
      const presetDate = new Date();
      presetDate.setDate(presetDate.getDate() + days);
      presetDate.setHours(0, 0, 0, 0);
      const expireDateCopy = new Date(formData.expireDate!);
      expireDateCopy.setHours(0, 0, 0, 0);
      if (expireDateCopy.getTime() === presetDate.getTime()) {
        return false;
      }
    }
    return true;
  })();

  // 判断某个预设天数是否被选中
  const isPresetDaysSelected = (days: number): boolean => {
    if (!formData.expireDate) return false;
    const presetDate = new Date();
    presetDate.setDate(presetDate.getDate() + days);
    presetDate.setHours(0, 0, 0, 0);
    const expireDateCopy = new Date(formData.expireDate);
    expireDateCopy.setHours(0, 0, 0, 0);
    return expireDateCopy.getTime() === presetDate.getTime();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* 兑换码内容 */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.icon }]}>
          兑换码内容 *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: colors.text,
              borderColor: errors.code ? '#F44336' : 'transparent',
              boxShadow: errors.code ? '0 0 0 1px rgba(244, 67, 54, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.08)',
            },
          ]}
          value={formData.code}
          onChangeText={(text) => updateField('code', text)}
          placeholder="请输入兑换码内容"
          placeholderTextColor={colors.icon}
        />
        {errors.code && (
          <Text style={styles.errorText}>{errors.code}</Text>
        )}
      </View>

      {/* 类别选择 */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.icon }]}>类别</Text>
        <TouchableOpacity
          style={[
            styles.picker,
            {
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            },
          ]}
          onPress={() => setShowCategoryPicker(true)}
        >
          {selectedCategory ? (
            <View style={styles.categoryRow}>
              <View
                style={[styles.colorDot, { backgroundColor: selectedCategory.color }]}
              />
              <Text style={[styles.pickerText, { color: colors.text }]}>
                {selectedCategory.name}
              </Text>
            </View>
          ) : (
            <Text style={[styles.pickerPlaceholder, { color: colors.icon }]}>
              选择类别
            </Text>
          )}
          <IconSymbol name="chevron-right" size={16} color={colors.icon} />
        </TouchableOpacity>

        {/* 类别选择器 */}
        {showCategoryPicker && (
          <View style={[
            styles.categoryPicker,
            {
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
          ]}>
            <TouchableOpacity
              style={styles.categoryOption}
              onPress={() => {
                updateField('categoryId', null);
                setShowCategoryPicker(false);
              }}
            >
              <Text style={[styles.categoryOptionText, { color: colors.text }]}>
                不选择类别
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryOption}
                onPress={() => {
                  updateField('categoryId', category.id);
                  // 自动填入类别的默认到期时间，没有则设为永久有效
                  updateField('expireDate', category.expireDate ? new Date(category.expireDate) : null);
                  setShowCategoryPicker(false);
                }}
              >
                <View style={[styles.colorDot, { backgroundColor: category.color }]} />
                <Text style={[styles.categoryOptionText, { color: colors.text }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 备注 */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.icon }]}>备注</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: colors.text,
              borderColor: errors.description ? '#F44336' : 'transparent',
              boxShadow: errors.description ? '0 0 0 1px rgba(244, 67, 54, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.08)',
            },
          ]}
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          placeholder="添加备注"
          placeholderTextColor={colors.icon}
          maxLength={500}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>

      {/* 到期日期 */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.icon }]}>到期日期</Text>
        <TouchableOpacity
          style={[
            styles.picker,
            {
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            },
          ]}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Text style={[styles.pickerText, { color: colors.text }]}>
            {formData.expireDate
            ? formatDate(formData.expireDate.getTime())
            : '永久有效'}
          </Text>
          <IconSymbol
            name={showDatePicker ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.icon}
          />
        </TouchableOpacity>

        {/* 日期快捷选择 */}
        {showDatePicker && (
          <View style={styles.dateOptions}>
            <TouchableOpacity
              style={[
                styles.dateOption,
                {
                  backgroundColor: formData.expireDate === null ? ACCENT_COLOR : (colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                },
              ]}
              onPress={() => {
                updateField('expireDate', null);
                setShowDatePicker(false);
              }}
            >
              <Text style={[styles.dateOptionText, { color: formData.expireDate === null ? '#fff' : colors.text }]}>永久有效</Text>
            </TouchableOpacity>
            {presetDays.map((days) => {
              const date = new Date();
              date.setDate(date.getDate() + days);
              const isSelected = isPresetDaysSelected(days);
              return (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.dateOption,
                    {
                      backgroundColor: isSelected ? ACCENT_COLOR : (colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                    },
                  ]}
                  onPress={() => {
                    updateField('expireDate', date);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={[styles.dateOptionText, { color: isSelected ? '#fff' : colors.text }]}>
                    {days}天后
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* 自定义日期按钮 */}
            <TouchableOpacity
              style={[
                styles.dateOption,
                {
                  backgroundColor: isCustomDate ? ACCENT_COLOR : (colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                },
              ]}
              onPress={() => {
                setShowDatePicker(false);
                setShowCustomDatePicker(true);
              }}
            >
              <Text style={[styles.dateOptionText, { color: isCustomDate ? '#fff' : colors.text }]}>
                自定义日期
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 自定义日期选择器 */}
      <DatePicker
        mode="date"
        value={formData.expireDate || new Date()}
        minDate={new Date()}
        onChange={(date) => {
          updateField('expireDate', date);
        }}
        onOk={(date) => {
          updateField('expireDate', date);
          setShowCustomDatePicker(false);
        }}
        onDismiss={() => setShowCustomDatePicker(false)}
        visible={showCustomDatePicker}
        format="YYYY-MM-DD"
      />

      {/* 通知设置 */}
      <View style={styles.field}>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            到期提醒
          </Text>
          <Switch
            value={formData.isNotifyEnabled}
            onValueChange={(value) => updateField('isNotifyEnabled', value)}
            trackColor={{ false: colors.border, true: ACCENT_COLOR }}
            thumbColor="#fff"
            // ios_backgroundColor="transparent"
            // style={{ backgroundColor: 'transparent' }}
          />
        </View>

        {formData.isNotifyEnabled && (
          <View style={styles.notifyDaysTags}>
            {notifyDaysOptions.map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.notifyDayTag,
                  {
                    backgroundColor: formData.notifyDays === days
                      ? ACCENT_COLOR
                      : colorScheme === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.05)',
                  },
                ]}
                onPress={() => updateField('notifyDays', days)}
              >
                <Text
                  style={[
                    styles.notifyDayTagText,
                    { color: formData.notifyDays === days ? '#fff' : colors.text },
                  ]}
                >
                  {days}天
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.notifyDays && (
          <Text style={styles.errorText}>{errors.notifyDays}</Text>
        )}
      </View>

      {/* 提交按钮 */}
      {showButtons && (
        <View style={styles.buttons}>
          <Button
            title="取消"
            onPress={onCancel}
            variant="outlined"
            size="large"
            style={styles.button}
          />
          <Button
            title={isEditing ? '保存' : '创建'}
            onPress={onSubmit}
            variant="filled"
            size="large"
            loading={loading}
            disabled={!formData.code.trim()}
            style={styles.button}
          />
        </View>
      )}
    </ScrollView>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderCurve: 'continuous',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  picker: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderCurve: 'continuous',
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryPicker: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoryOptionText: {
    fontSize: 16,
  },
  dateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  dateOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  dateOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifyDaysTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  notifyDayTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  notifyDayTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  button: {
    flex: 1,
  },
});
