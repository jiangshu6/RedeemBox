import { useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCodeForm } from '@/hooks/useCodeForm';
import { CodeForm } from '@/components/code';
import { Button, Toast } from '@/components/common';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUIStore } from '@/store/ui.store';

/**
 * 新建兑换码页面
 */
export default function NewCodeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { toast, hideToast } = useUIStore();

  const {
    formData,
    errors,
    loading,
    categories,
    updateField,
    submit,
  } = useCodeForm();

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

  return (
    <ThemedView style={styles.container}>
      {/* 头部 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>新建兑换码</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* 表单 */}
      <CodeForm
        formData={formData}
        errors={errors}
        categories={categories}
        loading={loading}
        isEditing={false}
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
          title="创建"
          onPress={handleSubmit}
          variant="filled"
          size="small"
          loading={loading}
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
  },
  button: {
    flex: 1,
  },
});
