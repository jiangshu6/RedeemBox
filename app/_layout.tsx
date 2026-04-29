import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotification } from '@/hooks/useNotification';
import { useSettingsStore } from '@/store/settings.store';
import { initDatabase } from '@/services/database.service';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * 根布局
 * 使用 Stack 导航，配置原生导航栏样式
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  
  useNotification();

  // 初始化数据库
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        console.log('数据库初始化成功');
        // 加载设置（包括主题模式）
        await loadSettings();
        setDbReady(true);
      } catch (error) {
        console.error('数据库初始化失败:', error);
        setDbError('数据库初始化失败');
      }
    };
    init();
  }, [loadSettings]);

  // 数据库未准备好时显示加载状态
  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        {dbError ? (
          <Text style={styles.errorText}>{dbError}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.loadingText}>正在初始化...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: 'transparent' },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="code/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="code/new"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="code/[id]/edit"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notification/history"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
});
