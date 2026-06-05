import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { useBackup } from '@/hooks/useBackup';
import { NotifyDaysSetting, NotifyTimeSetting, ThemeModeSetting } from '@/components/settings';
import { ConfirmDialog, Toast, Loading } from '@/components/common';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUIStore } from '@/store/ui.store';

/**
 * 应用版本号
 */
const APP_VERSION = '1.0.0';

/**
 * 设置页面
 * 使用自定义工具栏显示标题
 */
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const {
    notifyEnabled,
    defaultNotifyDays,
    notifyTime,
    themeMode,
    loadSettings,
    toggleNotifyEnabled,
    updateDefaultNotifyDays,
    updateNotifyTime,
    updateThemeMode,
    resetToDefaults,
  } = useSettings();

  const { handleExport, handleImport } = useBackup();

  const { confirmDialog, toast, hideToast, isLoading, loadingText } = useUIStore();

  // 初始化加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // section背景色
  const sectionBgColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  // 分割线颜色
  const dividerColor = colorScheme === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.04)';

  return (
    <ThemedView style={styles.container}>
      {/* 隐藏原生导航栏 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 自定义工具栏 */}
      <View style={[styles.toolbar, { paddingTop: insets.top + 4 }]}>
        <ThemedText type="title" style={styles.toolbarTitle}>设置</ThemedText>
        <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 20 + insets.bottom },
        ]}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* 通知设置 */}
        <View style={[styles.section, { backgroundColor: sectionBgColor }]}>
          {/* 通知开关 */}
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="bell" size={22} color={colors.icon} />
              <View style={styles.textGroup}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  开启通知
                </Text>
                <Text style={[styles.settingDesc, { color: colors.icon }]}>
                  在到期前提醒您使用兑换码
                </Text>
              </View>
            </View>
            <Switch
              value={notifyEnabled}
              onValueChange={(value : boolean) => toggleNotifyEnabled()}
              trackColor={{ false: colors.border, true: '#0a7ea4' }}
              thumbColor="#fff"
              // ios_backgroundColor="transparent"
              style={{ backgroundColor: 'transparent' }}
            />
          </View>

          {/* 通知天数设置 */}
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <NotifyDaysSetting
              value={defaultNotifyDays}
              onChange={updateDefaultNotifyDays}
              disabled={!notifyEnabled}
            />
          </View>

          {/* 通知时间设置 */}
          <View style={styles.settingRow}>
            <NotifyTimeSetting
              value={notifyTime}
              onChange={updateNotifyTime}
              disabled={!notifyEnabled}
            />
          </View>
        </View>

        {/* 外观设置 */}
        <View style={[styles.section, { backgroundColor: sectionBgColor }]}>
          <View style={styles.settingRow}>
            <ThemeModeSetting
              value={themeMode}
              onChange={updateThemeMode}
            />
          </View>
        </View>

        {/* 数据管理 */}
        <View style={[styles.section, { backgroundColor: sectionBgColor }]}>
          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: dividerColor }]}
            onPress={handleExport}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="square-and-arrow-up" size={22} color={colors.icon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                数据备份
              </Text>
            </View>
            <IconSymbol name="angle-right" size={16} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: dividerColor }]}
            onPress={handleImport}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="square-and-arrow-down" size={22} color={colors.icon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                数据导入
              </Text>
            </View>
            <IconSymbol name="angle-right" size={16} color={colors.icon} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/notification/history')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="clock" size={22} color={colors.icon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                通知历史
              </Text>
            </View>
            <IconSymbol name="angle-right" size={16} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* 关于 */}
        <View style={[styles.section, { backgroundColor: sectionBgColor }]}>
          <View style={[styles.actionRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="circle-info" size={22} color={colors.icon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                版本
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {APP_VERSION}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={resetToDefaults}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="arrow-triangle-2-circlepath" size={22} color="#F44336" />
              <Text style={[styles.settingLabel, { color: '#F44336' }]}>
                重置所有设置
              </Text>
            </View>
          </TouchableOpacity>
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

      {/* Toast提示 */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Loading */}
      <Loading visible={isLoading} text={loadingText ?? undefined} />
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
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  toolbarTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingTop: 0,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderCurve: 'continuous',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textGroup: {
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 13,
  },
  settingValue: {
    fontSize: 14,
  },
});
