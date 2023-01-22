import settingsObject from "../Classes/settingsObject"

let lineNameMap: Record<string, string> = {
  "ll99" : "99",
  "ll95" : "95",
  "ul95" : "95",
  "ul99" : "99",
  "targets" : "target",
  "values" : "main",
  "alt_targets" : "alt_target"
}

function getLineAesthetic(type: string, group: string, aesthetic: string, inputSettings: settingsObject): string | number {
  let mapName: string = group.includes("line") ? lineNameMap[type] : type;
  let settingName: string = aesthetic + "_" + mapName;
  return inputSettings[group][settingName].value;
}

export default getLineAesthetic;
