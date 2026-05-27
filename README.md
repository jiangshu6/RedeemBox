# RedeemBox

一款用于管理兑换码的 React Native 移动应用，基于 Expo 框架开发。支持兑换码的增删改查、分类管理、到期提醒通知以及数据备份与恢复功能。

## 技术栈

- **框架**: Expo SDK 54 / React Native 0.81
- **路由**: Expo Router
- **状态管理**: Zustand
- **本地存储**: expo-sqlite (SQLite)
- **语言**: TypeScript

## 开发环境

### 前置要求

- Node.js >= 18
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# 启动 Expo 开发服务器
pnpm start

# 或直接指定平台
pnpm android    # 运行在 Android 设备/模拟器
pnpm ios        # 运行在 iOS 设备/模拟器
pnpm web        # 运行在浏览器
```

## 打包构建

### 本地打包

**Android APK / AAB**

```bash
cd RedeemBox

# 生成 Debug APK
npx expo run:android --variant debug

# 生成 Release APK
npx expo run:android --variant release

# 生成 AAB (用于 Google Play 上架)
npx expo export --platform android --output-dir dist
```

### EAS Build 云端打包

> 需要安装 EAS CLI: `npm install -g eas-cli` 并登录 Expo 账号 `eas login`

**首次使用需初始化**

```bash
eas build:configure
```

**构建命令**

```bash
# Android APK (适合直接安装)
eas build --platform android --profile preview

# Android AAB (用于应用商店上架)
eas build --platform android --profile production

# iOS Build
eas build --platform ios --profile production

# 指定 profile 构建
eas build --platform android --profile development
```
