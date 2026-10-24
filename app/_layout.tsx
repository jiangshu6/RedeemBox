import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import { Provider as AntdProvider } from '@ant-design/react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotification } from '@/hooks/useNotification';
import { useSettingsStore } from '@/store/settings.store';
import { useUIStore } from '@/store/ui.store';
import { initDatabase } from '@/services/database.service';

// 忽略 expo-notifications 在 Expo Go 中的远程推送警告
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
]);

// 防止启动画面自动隐藏
SplashScreen.preventAutoHideAsync();

// Ant Design 浅色主题
const lightTheme = {
  brand_primary: '#0a7ea4',
  brand_primary_tap: '#0a7ea4',
  brand_success: '#52c41a',
  brand_warning: '#faad14',
  brand_error: '#f5222d',
  color_text_base: '#000000',
  color_text_base_inverse: '#ffffff',
  fill_body: '#ffffff',
  fill_base: '#ffffff',
  fill_caption: '#f5f5f5',
  border_color_base: '#d9d9d9',
};

// Ant Design 深色主题
const darkTheme = {
  brand_primary: '#0a7ea4',
  brand_primary_tap: '#0a7ea4',
  brand_success: '#52c41a',
  brand_warning: '#faad14',
  brand_error: '#f5222d',
  color_text_base: '#ffffff',
  color_text_base_inverse: '#000000',
  fill_body: '#1a1a1a',
  fill_base: '#2a2a2a',
  fill_caption: '#3a3a3a',
  border_color_base: '#434343',
};

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

  useNotification(dbReady);

  // 初始化数据库和字体
  useEffect(() => {
    const init = async () => {
      try {
        // 加载 Ant Design 字体
        await Font.loadAsync({
          antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
          antfill: require('@ant-design/icons-react-native/fonts/antfill.ttf'),
        });
        console.log('字体加载成功');

        // 初始化数据库
        await initDatabase();
        console.log('数据库初始化成功');

        // 加载设置（包括主题模式）
        await loadSettings();
        setDbReady(true);

        // 隐藏启动画面
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('初始化失败:', error);
        setDbError('初始化失败');
        // 即使出错也隐藏启动画面
        await SplashScreen.hideAsync();
      }
    };
    init();
  }, [loadSettings]);

  // 数据库初始化出错时显示错误信息
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{dbError}</Text>
      </View>
    );
  }

  // 数据库未准备好时不渲染内容（保持启动画面）
  if (!dbReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AntdProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
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
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </AntdProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
});
