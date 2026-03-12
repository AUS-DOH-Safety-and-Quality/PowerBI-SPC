import { defaultSettings, type defaultSettingsType } from "../../src/settings";

/**
 * Creates a deep copy of defaultSettings with specified overrides applied.
 * Supports dot-notation paths for nested properties.
 *
 * @param overrides - Object with dot-notation keys mapping to override values.
 *   e.g., { "spc.chart_type": "p", "outliers.improvement_direction": "increase" }
 * @returns A new defaultSettingsType with overrides applied.
 */
export default function buildSettings(overrides: Record<string, any>): defaultSettingsType {
  const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));

  for (const [path, value] of Object.entries(overrides)) {
    const keys = path.split(".");
    let target: any = settings;
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
  }

  return settings;
}
