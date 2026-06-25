import { withProjectBuildGradle, ConfigPlugin } from "@expo/config-plugins";

/**
 * 预置的镜像源配置
 */
interface MirrorConfig {
  google: string | null;
  public: string | null;
  gradlePlugin: string | null;
  jcenter: string | null;
  jitpack: string;
}

const MIRROR_SOURCES: Record<string, MirrorConfig> = {
  /** 阿里云镜像（国内推荐） */
  aliyun: {
    google: "https://maven.aliyun.com/repository/google",
    public: "https://maven.aliyun.com/repository/public",
    gradlePlugin: "https://maven.aliyun.com/repository/gradle-plugin",
    jcenter: "https://maven.aliyun.com/repository/jcenter",
    jitpack: "https://www.jitpack.io",
  },
  /** 华为云镜像 */
  huawei: {
    google: "https://repo.huaweicloud.com/repository/maven/",
    public: "https://repo.huaweicloud.com/repository/maven/",
    gradlePlugin: "https://repo.huaweicloud.com/repository/maven/",
    jcenter: "https://repo.huaweicloud.com/repository/maven/",
    jitpack: "https://www.jitpack.io",
  },
  /** 腾讯云镜像 */
  tencent: {
    google: "https://mirrors.cloud.tencent.com/nexus/repository/maven-public/",
    public: "https://mirrors.cloud.tencent.com/nexus/repository/maven-public/",
    gradlePlugin: "https://mirrors.cloud.tencent.com/nexus/repository/maven-public/",
    jcenter: "https://mirrors.cloud.tencent.com/nexus/repository/maven-public/",
    jitpack: "https://www.jitpack.io",
  },
  /** 默认源（官方） */
  default: {
    google: null,
    public: null,
    gradlePlugin: null,
    jcenter: null,
    jitpack: "https://www.jitpack.io",
  },
};

/**
 * 镜像源类型
 */
type MirrorSource = "aliyun" | "huawei" | "tencent" | "default" | "custom";

/**
 * 自定义镜像配置
 */
interface CustomMirrors {
  google?: string;
  public?: string;
  gradlePlugin?: string;
  jcenter?: string;
  jitpack?: string;
}

/**
 * Gradle 镜像插件配置
 */
interface GradleMirrorPluginProps {
  /** 镜像源 */
  source?: MirrorSource;
  /** 是否在镜像后保留官方源作为备用 */
  includeOfficial?: boolean;
  /** 自定义镜像配置（当 source="custom" 时使用） */
  customMirrors?: CustomMirrors;
}

/**
 * 生成仓库配置块
 */
function generateRepositoriesBlock(
  mirrors: MirrorConfig,
  includeOfficial: boolean = true
): string {
  const lines: string[] = [];

  // 添加镜像源
  if (mirrors.google) {
    lines.push(`    maven { url '${mirrors.google}' }`);
  }
  if (mirrors.public) {
    lines.push(`    maven { url '${mirrors.public}' }`);
  }
  if (mirrors.gradlePlugin) {
    lines.push(`    maven { url '${mirrors.gradlePlugin}' }`);
  }
  if (mirrors.jcenter) {
    lines.push(`    maven { url '${mirrors.jcenter}' }`);
  }

  // 添加官方源作为备用
  if (includeOfficial) {
    lines.push("    google()");
    lines.push("    mavenCentral()");
  }

  // 添加 jitpack
  if (mirrors.jitpack) {
    lines.push(`    maven { url '${mirrors.jitpack}' }`);
  }

  return lines.join("\n");
}

/**
 * Expo Config Plugin 用于配置 Gradle 仓库镜像
 *
 * 此插件会修改 android/build.gradle 中的仓库配置，支持使用国内镜像加速依赖下载。
 *
 * @example
 * // app.json - 使用阿里云镜像
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "./plugins/gradle-mirror-plugin",
 *         {
 *           "source": "aliyun",
 *           "includeOfficial": true
 *         }
 *       ]
 *     ]
 *   }
 * }
 *
 * @example
 * // app.json - 使用自定义镜像
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "./plugins/gradle-mirror-plugin",
 *         {
 *           "source": "custom",
 *           "customMirrors": {
 *             "google": "https://my-mirror.com/google",
 *             "public": "https://my-mirror.com/public"
 *           }
 *         }
 *       ]
 *     ]
 *   }
 * }
 */
const gradleMirrorPlugin: ConfigPlugin<GradleMirrorPluginProps> = (
  config,
  props = {}
) => {
  const {
    source = "aliyun",
    includeOfficial = true,
    customMirrors,
  } = props;

  // 获取镜像配置
  let mirrors: MirrorConfig;
  if (source === "custom" && customMirrors) {
    mirrors = {
      ...MIRROR_SOURCES.default,
      ...customMirrors,
    };
  } else if (MIRROR_SOURCES[source]) {
    mirrors = MIRROR_SOURCES[source];
  } else {
    throw new Error(
      `Unknown mirror source: ${source}. Available sources: ${Object.keys(MIRROR_SOURCES).join(", ")}`
    );
  }

  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    const repositoriesContent = generateRepositoriesBlock(mirrors, includeOfficial);
    const newRepositoriesBlock = `repositories {
${repositoriesContent}
  }`;

    // 使用正则表达式替换 buildscript 中的 repositories 内容
    const buildscriptPattern = /buildscript\s*\{\s*repositories\s*\{[\s\S]*?\}\s*\n\s*dependencies/;
    if (buildscriptPattern.test(contents)) {
      contents = contents.replace(
        buildscriptPattern,
        `buildscript {
  ${newRepositoriesBlock}

  dependencies`
      );
    }

    // 使用正则表达式替换 allprojects 中的 repositories 内容
    const allprojectsPattern = /allprojects\s*\{\s*repositories\s*\{[\s\S]*?\}\s*\n\}/;
    if (allprojectsPattern.test(contents)) {
      contents = contents.replace(
        allprojectsPattern,
        `allprojects {
  ${newRepositoriesBlock}
}`
      );
    }

    config.modResults.contents = contents;
    return config;
  });

  return config;
};

export default gradleMirrorPlugin;
export { MIRROR_SOURCES };