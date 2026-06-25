import "tsx/cjs";
import { ExpoConfig, ConfigContext } from 'expo/config';
import { env } from 'process';
const STORE_FILE = env.STORE_FILE;
const KEY_ALIAS = env.KEY_ALIAS;
const STORE_PASSWORD = env.STORE_PASSWORD;
const KEY_PASSWORD = env.KEY_PASSWORD;
export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "RedeemBox",
    slug: "RedeemBox",
    plugins: [
        // "./plugins/withTest.ts",
        [
            "./plugins/local-build-plugin.ts", {
                signingConfig: {
                    storeFile: STORE_FILE,
                    keyAlias: KEY_ALIAS,
                    storePassword: STORE_PASSWORD,
                    keyPassword: KEY_PASSWORD
                },
                enableShrinkResources: false,
                enableMinify: false,
                abiSplits: {
                    enable: true,
                    universalApk: false,
                    include: ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"]
                }
            }
        ],
        [
            "./plugins/gradle-mirror-plugin.ts",
            {
                source: "aliyun",
                includeOfficial: true
            }
        ],
    ]
});
