import { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCode } from '@/hooks/useCode';
import { useUIStore } from '@/store/ui.store';
import { CodeStatusBadge } from '@/components/code';
import { Button, ConfirmDialog } from '@/components/common';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RedemptionCodeStatus } from '@/types';
import { formatDate, formatDateTime, getDaysUntilExpire, isExpired } from '@/utils/date';

/**
 * 兑换码详情页面
 */
export default function CodeDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const codeId = useMemo(() => (id ? parseInt(id, 10) : null), [id]);

  const {
    code,
    loading,
    categoryNameMap,
    copyCode,
    markAsUsed,
    deleteCode,
  } = useCode(codeId);

  const { confirmDialog } = useUIStore();

  // 处理编辑
  const handleEdit = useCallback(() => {
    if (code) {
      router.push(`/code/${code.id}/edit`);
    }
  }, [code]);

  // 处理返回
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // 处理删除成功后返回
  const handleDelete = useCallback(async () => {
    const success = await deleteCode();
    if (success) {
      router.back();
    }
  }, [deleteCode]);

  if (loading || !code) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron-left" size={24} color={colors.tint} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>兑换码详情</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </ThemedView>
    );
  }

  const daysUntilExpire = getDaysUntilExpire(code.expireDate);
  const expired = isExpired(code.expireDate);
  const categoryName = code.categoryId ? categoryNameMap[code.categoryId] : null;

  return (
    <ThemedView style={styles.container}>
      {/* 头部 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>兑换码详情</ThemedText>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <IconSymbol name="pen" size={20} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 状态和类别 */}
        <View style={styles.statusRow}>
          <CodeStatusBadge status={code.status} />
          {categoryName && (
            <View style={[styles.categoryTag, { backgroundColor: colors.border }]}>
              <Text style={[styles.categoryText, { color: colors.icon }]}>
                {categoryName}
              </Text>
            </View>
          )}
        </View>

        {/* 兑换码内容 */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.icon }]}>兑换码内容</Text>
          <TouchableOpacity
            style={[styles.codeBox, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5', borderColor: colors.border }]}
            onPress={copyCode}
          >
            <Text style={[styles.codeText, { color: colors.text }]} selectable>
              {code.code}
            </Text>
            <IconSymbol name="copy" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {/* 备注 */}
        {code.description && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.icon }]}>备注</Text>
            <Text style={[styles.value, { color: colors.text }]}>{code.description}</Text>
          </View>
        )}

        {/* 到期信息 */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.icon }]}>到期日期</Text>
          <View style={styles.expireRow}>
            <Text style={[styles.value, { color: expired ? '#F44336' : colors.text }]}>
              {code.expireDate ? formatDate(code.expireDate) : '永久有效'}
            </Text>
            {code.expireDate && !expired && code.status === RedemptionCodeStatus.ACTIVE && (
              <Text style={[styles.daysLeft, { color: daysUntilExpire && daysUntilExpire <= 7 ? '#FF9800' : colors.icon }]}>
                {daysUntilExpire}天后到期
              </Text>
            )}
            {expired && code.status === RedemptionCodeStatus.ACTIVE && (
              <Text style={[styles.daysLeft, { color: '#F44336' }]}>已过期</Text>
            )}
          </View>
        </View>

        {/* 通知设置 */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.icon }]}>到期提醒</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {code.isNotifyEnabled
              ? `提前 ${code.notifyDays ?? 3} 天提醒`
              : '未开启'}
          </Text>
        </View>

        {/* 时间信息 */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.icon }]}>创建时间</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {formatDateTime(code.createdAt)}
          </Text>
        </View>

        {code.usedAt && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.icon }]}>使用时间</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatDateTime(code.usedAt)}
            </Text>
          </View>
        )}

        {/* 操作按钮 */}
        <View style={styles.actions}>
          <Button
            title="复制兑换码"
            onPress={copyCode}
            variant="outlined"
            size="large"
            style={styles.actionButton}
          />
          {code.status === RedemptionCodeStatus.ACTIVE && (
            <Button
              title="标记为已使用"
              onPress={markAsUsed}
              variant="outlined"
              size="large"
              style={styles.actionButton}
            />
          )}
          <Button
            title="删除兑换码"
            onPress={handleDelete}
            variant="text"
            size="large"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

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
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    lineHeight: 24,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  codeText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  expireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  daysLeft: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
