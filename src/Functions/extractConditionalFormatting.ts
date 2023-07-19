import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewCategorical = powerbi.DataViewCategorical;
import settingsClass from "../Classes/settingsClass";
import defaultSettings, { defaultSettingsType, defaultSettingsKey } from "../Classes/defaultSettings";
import extractSetting from "./extractSetting";


function extractConditionalFormatting<SettingsT extends defaultSettingsType[defaultSettingsKey]>(categoricalView: DataViewCategorical, name: string, inputSettings: settingsClass): SettingsT[] {
  if ((categoricalView === null) || (categoricalView === undefined)) {
    return [null];
  }
  const inputCategories: DataViewCategoryColumn = (categoricalView.categories as DataViewCategoryColumn[])[0];
  const settingNames = Object.getOwnPropertyNames(inputSettings[name])

  const rtn: SettingsT[] = new Array<SettingsT>();
  for (let i: number = 0; i < inputCategories.values.length; i++) {
    rtn.push(
      Object.fromEntries(
        settingNames.map(settingName => {
          return [
            settingName,
            extractSetting((inputCategories.objects ? inputCategories.objects[i] : null) as powerbi.DataViewObjects,
                            name, settingName, defaultSettings[name][settingName])
          ]
        })
      ) as SettingsT
    )
  }
  return rtn
}

export default extractConditionalFormatting
