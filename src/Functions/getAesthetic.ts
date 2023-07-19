import settingsClass from "../Classes/settingsClass"

const lineNameMap: Record<string, string> = {
  "ll99" : "99",
  "ll95" : "95",
  "ul95" : "95",
  "ul99" : "99",
  "targets" : "target",
  "values" : "main",
  "alt_targets" : "alt_target"
}

export default function getAesthetic(type: string, group: string, aesthetic: string, inputSettings: settingsClass): string | number {
  const mapName: string = group.includes("line") ? lineNameMap[type] : type;
  const settingName: string = aesthetic + "_" + mapName;
  return inputSettings[group][settingName];
}
