import {
  withGradleProperties,
  withAppBuildGradle,
  withDangerousMod,
  ConfigPlugin,
} from "@expo/config-plugins";
import { ExpoConfig } from "expo/config";

const withTest: ConfigPlugin<string> = (config: ExpoConfig) => {
    return withAppBuildGradle(config, (config) => {
        const contents = config.mods?.android?.appBuildGradle?.isIntrospective;
        console.log(contents);
        
        return config;
    })
}
export default withTest;