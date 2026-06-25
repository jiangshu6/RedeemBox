import {
  withGradleProperties,
  withAppBuildGradle,
  withDangerousMod,
  ConfigPlugin,
} from "@expo/config-plugins";
import { ExpoConfig } from "expo/config";
import fs from "fs";
import path from "path";

/**
 * 本地打包签名配置
 */
interface SigningConfig {
  /** keystore 文件名（相对于项目根目录） */
  storeFile: string;
  /** keystore 别名 */
  keyAlias: string;
  /** keystore 密码 */
  storePassword: string;
  /** key 密码 */
  keyPassword: string;
}

/**
 * 支持的 ABI 架构类型
 */
type AbiArchitecture = "armeabi-v7a" | "arm64-v8a" | "x86" | "x86_64";

/**
 * ABI 分包配置
 */
interface AbiSplitsConfig {
  /** 是否启用 ABI 分包 */
  enable?: boolean;
  /** 是否生成通用 APK（包含所有架构） */
  universalApk?: boolean;
  /** 包含的架构列表 */
  include?: AbiArchitecture[];
}

/**
 * 本地打包插件配置
 */
interface LocalBuildPluginProps {
  /** 签名配置 */
  signingConfig?: SigningConfig;
  /** 是否启用资源压缩 */
  enableShrinkResources?: boolean;
  /** 是否启用代码压缩 (ProGuard/R8) */
  enableMinify?: boolean;
  /** ABI 分包配置 */
  abiSplits?: AbiSplitsConfig;
}

/**
 * Expo Config Plugin 用于配置本地打包
 *
 * 此插件会自动配置 Android 本地打包所需的签名配置：
 * 1. 复制 keystore 文件到 android/app 目录
 * 2. 在 gradle.properties 中添加签名变量
 * 3. 在 build.gradle 中添加 release 签名配置
 * 4. 配置 ABI 分包设置
 *
 * @example
 * // app.json
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "./plugins/local-build-plugin",
 *         {
 *           "signingConfig": {
 *             "storeFile": "release-key.keystore",
 *             "keyAlias": "my-key-alias",
 *             "storePassword": "your-store-password",
 *             "keyPassword": "your-key-password"
 *           },
 *           "enableShrinkResources": false,
 *           "enableMinify": false,
 *           "abiSplits": {
 *             "enable": true,
 *             "universalApk": false,
 *             "include": ["armeabi-v7a", "arm64-v8a"]
 *           }
 *         }
 *       ]
 *     ]
 *   }
 * }
 */
const localBuildPlugin: ConfigPlugin<LocalBuildPluginProps> = (
  config: ExpoConfig,
  props = {}
) => {
  const {
    signingConfig,
    enableShrinkResources = false,
    enableMinify = false,
    abiSplits,
  } = props;

  // 复制 keystore 文件到 android/app 目录
  if (signingConfig && signingConfig.storeFile) {
    config = withDangerousMod(config, [
      "android",
      (config) => {
        const projectRoot = config.modRequest.projectRoot;
        const androidAppPath = path.join(projectRoot, "android", "app");

        // keystore 源文件路径（相对于项目根目录）
        const keystoreSourcePath = path.join(projectRoot, signingConfig.storeFile);
        // keystore 目标路径
        const keystoreDestPath = path.join(androidAppPath, signingConfig.storeFile);

        // 检查源文件是否存在
        if (fs.existsSync(keystoreSourcePath)) {
          // 确保 android/app 目录存在
          if (!fs.existsSync(androidAppPath)) {
            fs.mkdirSync(androidAppPath, { recursive: true });
          }

          // 复制 keystore 文件
          fs.copyFileSync(keystoreSourcePath, keystoreDestPath);
          console.log(`[local-build-plugin] Copied keystore: ${signingConfig.storeFile} -> android/app/${signingConfig.storeFile}`);
        } else {
          console.warn(`[local-build-plugin] Keystore file not found: ${keystoreSourcePath}`);
        }

        return config;
      },
    ]);
  }

  // 配置 gradle.properties
  config = withGradleProperties(config, (config) => {
    const properties = config.modResults;

    // 添加签名配置到 gradle.properties
    if (signingConfig) {
      // 移除已存在的同名配置
      const propertiesToRemove = [
        "MYAPP_UPLOAD_STORE_FILE",
        "MYAPP_UPLOAD_KEY_ALIAS",
        "MYAPP_UPLOAD_STORE_PASSWORD",
        "MYAPP_UPLOAD_KEY_PASSWORD",
      ];

      config.modResults = properties.filter(
        (item) => !(item.type === "property" && propertiesToRemove.includes(item.key))
      );

      // 添加新配置
      config.modResults.push({
        type: "property",
        key: "MYAPP_UPLOAD_STORE_FILE",
        value: signingConfig.storeFile,
      });
      config.modResults.push({
        type: "property",
        key: "MYAPP_UPLOAD_KEY_ALIAS",
        value: signingConfig.keyAlias,
      });
      config.modResults.push({
        type: "property",
        key: "MYAPP_UPLOAD_STORE_PASSWORD",
        value: signingConfig.storePassword,
      });
      config.modResults.push({
        type: "property",
        key: "MYAPP_UPLOAD_KEY_PASSWORD",
        value: signingConfig.keyPassword,
      });
    }

    // 添加资源压缩配置
    const shrinkResourcesKey = "android.enableShrinkResourcesInReleaseBuilds";
    config.modResults = config.modResults.filter(
      (item) => !(item.type === "property" && item.key === shrinkResourcesKey)
    );
    config.modResults.push({
      type: "property",
      key: shrinkResourcesKey,
      value: String(enableShrinkResources),
    });

    // 添加代码压缩配置
    const minifyKey = "android.enableMinifyInReleaseBuilds";
    config.modResults = config.modResults.filter(
      (item) => !(item.type === "property" && item.key === minifyKey)
    );
    config.modResults.push({
      type: "property",
      key: minifyKey,
      value: String(enableMinify),
    });

    return config;
  });

  // 配置 build.gradle
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    // 使用正则表达式添加 signingConfigs 中的 release 配置
    const releaseSigningConfig = `
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    `;

    // 正则匹配整个 signingConfigs 块
    const signingConfigsPattern = /([\s]*signingConfigs[\s]*\{)((?:[^\{\}]*\{[^\{\}]*\})|([^\{\}]*\{){2}([^\{\}]*\}){2})*[^\{\}]*\}/g;
    if (signingConfigsPattern.test(contents)) {
      // 检查 signingConfigs 块内是否已有 release 配置
      // 只匹配 signingConfigs 块内的内容，不跨越到其他块
      const signingConfigsMatch = contents.match(signingConfigsPattern);
      const hasReleaseInSigningConfigs = signingConfigsMatch &&
        /release\s*\{/.test(signingConfigsMatch[0]);

      if (!hasReleaseInSigningConfigs) {
        contents = contents.replace(
          signingConfigsPattern,
          (match) => match.replace(/\n    \}/, releaseSigningConfig + `}`)
        );
      }
    }

    // 使用正则表达式替换 buildTypes 中 release 的 signingConfig
    // 先匹配整个 buildTypes 块，然后在其中替换 release 的 signingConfig
    const buildTypesPattern = /([\s]*buildTypes[\s]*\{)((?:[^\{\}]*\{[^\{\}]*\})|([^\{\}]*\{){2}([^\{\}]*\}){2})*[^\{\}]*\}/;
    if (buildTypesPattern.test(contents)) {
      const buildTypesMatch = contents.match(buildTypesPattern);
      if (buildTypesMatch) {
        // 检查 release 块中是否有 signingConfig signingConfigs.debug
        const releaseBlockPattern = /release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.debug[\s\S]*?\}/;
        if (releaseBlockPattern.test(buildTypesMatch[0])) {
          contents = contents.replace(
            buildTypesPattern,
            (match) => match.replace(
              /release\s*\{([\s\S]*?)signingConfig\s+signingConfigs\.debug/,
              `release {$1signingConfig signingConfigs.release`
            )
          );
        }
      }
    }

    // 确保 debug 块使用 signingConfigs.debug
    // const buildTypesDebugPattern = /(buildTypes\s*\{[\s\S]*?debug\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.release/;
    // if (buildTypesDebugPattern.test(contents)) {
    //   contents = contents.replace(
    //     buildTypesDebugPattern,
    //     "$1signingConfig signingConfigs.debug"
    //   );
    // }

    // 配置 ABI 分包
    if (abiSplits) {
      const enable = abiSplits.enable ?? true;
      const universalApk = abiSplits.universalApk ?? false;
      const include = abiSplits.include ?? ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"];

      const newSplitsBlock = `    splits {
        abi {
            reset()
            enable ${enable}
            universalApk ${universalApk}
            include "${include.join('", "')}"
        }
    }`;

      // 使用正则表达式替换现有的 splits 块
      const splitsPattern = /splits\s*\{[\s\S]*?abi\s*\{[\s\S]*?\}[\s\S]*?\}/;
      if (splitsPattern.test(contents)) {
        contents = contents.replace(splitsPattern, newSplitsBlock);
      } else {
        // 如果不存在 splits 块，在 android 块末尾添加
        // 使用正则表达式匹配 android 块
        const androidPattern = /(android\s*\{[\s\S]*?\n\})/;
        if (androidPattern.test(contents)) {
          contents = contents.replace(
            androidPattern,
            (match) => match.replace(/\n\}/, `\n${newSplitsBlock}\n}`)
          );
        }
      }
    }

    config.modResults.contents = contents;
    return config;
  });

  return config;
};

export default localBuildPlugin;