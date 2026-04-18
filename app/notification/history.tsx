import { useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNotificationStore } from '@/store/notification.store';
import { useUIStore } from '@/store/ui.store';
import { NotificationItem } from '@/components/notification';
import { ConfirmDialog, EmptyState, Toast } from '@/components/common';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NotificationRecordWithCode } from '@/types';

/**
 * 通知历史页面
 */
export default function NotificationHistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { records, fetchHistory } = useNotificationStore();
  const { confirmDialog, toast, hideToast } = useUIStore();

  // 加载通知历史
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 点击通知项
  const handlePressItem = useCallback((record: NotificationRecordWithCode) => {
    // 跳转到对应的兑换码详情
    router.push(`/code/${record.codeId}`);
  }, []);

  // 渲染空状态
  const renderEmpty = () => (
    <EmptyState
      title="暂无通知记录"
      description="到期提醒通知将显示在这里"
      icon={<IconSymbol name="bell-slash" size={48} color={colors.icon} />}
    />
  );

  return (
    <ThemedView style={styles.container}>
      {/* 头部 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>通知历史</ThemedText>
        {records.length > 0 ? (
          <TouchableOpacity 
            onPress={() => {
              useUIStore.getState().showConfirm({
                title: '清除历史',
                message: '确定要清除所有通知历史吗？',
                confirmText: '清除',
                cancelText: '取消',
                danger: true,
                onConfirm: async () => {
                  useUIStore.getState().hideConfirm();
                  await useNotificationStore.getState().clearHistory();
                  useUIStore.getState().showToast('已清除', 'success');
                },
                onCancel: () => {
                  useUIStore.getState().hideConfirm();
                },
              });
            }} 
            style={styles.clearButton}
          >
            <IconSymbol name="trash" size={20} color={colors.tint} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* 列表 */}
      {records.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem
              record={item}
              onPress={handlePressItem}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        danger={true}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel ?? (() => {})}
      />

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
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
});
