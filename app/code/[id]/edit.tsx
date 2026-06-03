import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCodeForm } from '@/hooks/useCodeForm';
import { CodeForm } from '@/components/code';
import { Button, Toast } from '@/components/common';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUIStore } from '@/store/ui.store';
import { CodeRepository } from '@/repositories/code.repository';
import { RedemptionCode } from '@/types';

/**
 * 编辑兑换码页面
 */
export default function EditCodeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toast, hideToast, showLoading, hideLoading } = useUIStore();

  const [code, setCode] = useState<RedemptionCode | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    formData,
    errors,
    categories,
    updateField,
    submit,
  } = useCodeForm(code);

  // 加载兑换码数据
  useEffect(() => {
    const loadCode = async () => {
      if (!id) return;
      showLoading('加载中...');
      const codeData = await CodeRepository.getById(parseInt(id, 10));
      hideLoading();
      setCode(codeData);
      setLoading(false);
    };
    loadCode();
  }, [id, showLoading, hideLoading]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const success = await submit();
    if (success) {
      router.back();
    }
    return success;
  }, [submit]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <IconSymbol name="chevron-left" size={24} color={colors.tint} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>编辑兑换码</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </ThemedView>
    );
  }

  if (!code) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <IconSymbol name="chevron-left" size={24} color={colors.tint} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>兑换码不存在</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* 头部 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>编辑兑换码</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* 表单 */}
      <CodeForm
        formData={formData}
        errors={errors}
        categories={categories}
        loading={false}
        isEditing={true}
        showButtons={false}
        updateField={updateField}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      />

      {/* 底部固定按钮 */}
      <View style={[
        styles.footer,
        {
          paddingBottom: insets.bottom + 16,
          backgroundColor: colors.background,
        },
      ]}>
        <Button
          title="取消"
          onPress={handleCancel}
          variant="outlined"
          size="small"
          style={styles.button}
        />
        <Button
          title="保存"
          onPress={handleSubmit}
          variant="filled"
          size="small"
          disabled={!formData.code.trim()}
          style={styles.button}
        />
      </View>

      {/* Toast提示 */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ThemedView>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
  },
});
