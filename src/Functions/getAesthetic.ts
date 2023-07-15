import settingsObject from "../Classes/settingsObject"
import { settingsKeyT, nestedSettingsT } from "../Classes/settingsObject";

const lineNameMap: Record<string, string> = {
  "ll99" : "99",
  "ll95" : "95",
  "ul95" : "95",
  "ul99" : "99",
  "targets" : "target",
  "values" : "main",
  "alt_targets" : "alt_target"
}

function getAesthetic(type: string, group: string, aesthetic: string, inputSettings: settingsObject): string | number | boolean {
  const mapName: string = group.includes("line") ? lineNameMap[type] : type;
  const settingName: string = aesthetic + "_" + mapName;
  return (inputSettings[group as settingsKeyT] as nestedSettingsT)[settingName].value;
}

export default getAesthetic;
