import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { NotifyDaysSetting, ThemeModeSetting } from '@/components/settings';
import { ConfirmDialog, Toast } from '@/components/common';
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
    themeMode,
    loadSettings,
    toggleNotifyEnabled,
    updateDefaultNotifyDays,
    updateThemeMode,
    resetToDefaults,
  } = useSettings();

  const { confirmDialog, toast, hideToast } = useUIStore();

  // 初始化加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // section背景色 - 深色模式下使用稍亮的背景
  const sectionBgColor = colorScheme === 'dark' 
    ? '#1c1c1e' 
    : colors.background;

  // 分割线颜色
  const dividerColor = colorScheme === 'dark'
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.1)';

  // 图标颜色 - 深色模式下使用蓝色而不是白色
  const iconColor = colorScheme === 'dark' ? '#0a7ea4' : colors.tint;

  return (
    <ThemedView style={styles.container}>
      {/* 隐藏原生导航栏 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 自定义工具栏 */}
      <View style={[styles.toolbar, { paddingTop: insets.top }]}>
        <ThemedText type="title" style={styles.toolbarTitle}>设置</ThemedText>
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
        <View style={[styles.section, { backgroundColor: sectionBgColor, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>通知设置</ThemedText>
          
          {/* 通知开关 */}
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="bell" size={22} color={iconColor} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                开启通知
              </Text>
            </View>
            <Switch
              value={notifyEnabled}
              onValueChange={() => { toggleNotifyEnabled(); }}
              trackColor={{ false: colors.border, true: '#0a7ea4' }}
              thumbColor="#fff"
            />
          </View>

          {/* 通知天数设置 */}
          <View style={styles.settingItem}>
            <NotifyDaysSetting
              value={defaultNotifyDays}
              onChange={updateDefaultNotifyDays}
              disabled={!notifyEnabled}
            />
          </View>
        </View>

        {/* 外观设置 */}
        <View style={[styles.section, { backgroundColor: sectionBgColor, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>外观</ThemedText>
          
          <View style={styles.settingItem}>
            <ThemeModeSetting
              value={themeMode}
              onChange={updateThemeMode}
            />
          </View>
        </View>

        {/* 数据管理 */}
        <View style={[styles.section, { backgroundColor: sectionBgColor, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>数据管理</ThemedText>
          
          {/* 通知历史 */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: dividerColor }]}
            onPress={() => router.push('/notification/history')}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="clock" size={22} color={iconColor} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                通知历史
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={16} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* 关于 */}
        <View style={[styles.section, { backgroundColor: sectionBgColor, borderColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>关于</ThemedText>
          
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="circle-info" size={22} color={iconColor} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                版本
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {APP_VERSION}
            </Text>
          </View>

          {/* 重置设置 */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={resetToDefaults}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="rotate-left" size={22} color="#F44336" />
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
    paddingBottom: 12,
  },
  toolbarTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  settingItem: {
    paddingTop: 8,
  },
});
