import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/ui.store';


/**
 * 通知天数设置属性
 */
interface NotifyDaysSettingProps {
  value: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}

/**
 * 通知天数设置组件
 * 行内编辑模式，与设置页风格统一
 */
export function NotifyDaysSetting({
  value,
  onChange,
  disabled = false,
}: NotifyDaysSettingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const days = parseInt(inputValue, 10);
    if (isNaN(days) || days <= 0 || days > 365) {
      useUIStore.getState().showToast('请输入1-365之间的数字', 'error');
      setInputValue(value.toString());
      setIsEditing(false);
      return;
    }

    onChange(days);
    setIsEditing(false);
    useUIStore.getState().showToast('已保存', 'success');
  };

  const handleCancel = () => {
    setInputValue(value.toString());
    setIsEditing(false);
  };

  const handleEdit = () => {
    setInputValue(value.toString());
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <View style={styles.editRow}>
        <View style={styles.settingLeft}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            提前天数
          </Text>
          <Text style={[styles.settingDesc, { color: colors.icon }]}>
            1-365天
          </Text>
        </View>
        <View style={styles.editControls}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5',
                color: colors.text,
              },
            ]}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="number-pad"
            maxLength={3}
            autoFocus
            onSubmitEditing={handleSave}
          />
          <View style={styles.editButtons}>
            <Button
              title="取消"
              onPress={handleCancel}
              variant="outlined"
              size="small"
              style={styles.buttonSmall}
            />
            <Button
              title="保存"
              onPress={handleSave}
              variant="filled"
              size="small"
              style={styles.buttonSmall}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.settingLeft}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          提前天数
        </Text>
        <Text style={[styles.settingDesc, { color: colors.icon }]}>
          到期前{value}天提醒
        </Text>
      </View>
      <Button
        title={value > 1 ? `${value}天` : `${value}天`}
        onPress={handleEdit}
        variant="outlined"
        size="small"
        disabled={disabled}
        style={styles.valueButton}
        textStyle={{ fontSize: 14 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    width: 60,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonSmall: {
    minWidth: 0,
    paddingHorizontal: 12,
  },
  valueButton: {
    minWidth: 56,
  },
});
