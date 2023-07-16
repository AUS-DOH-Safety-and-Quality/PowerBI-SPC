import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewCategorical = powerbi.DataViewCategorical;
import settingsObject from "../Classes/settingsObject";
import { defaultSettingsType, defaultSettingsKey } from "../Classes/defaultSettings";
import extractSetting from "./extractSetting";


function extractConditionalFormatting<SettingsT extends defaultSettingsType[defaultSettingsKey]>(inputView: DataViewCategorical, name: string, inputSettings: settingsObject): SettingsT[] {
  const inputCategories: DataViewCategoryColumn = (inputView.categories as DataViewCategoryColumn[])[0];
  const settingNames = Object.getOwnPropertyNames(inputSettings[name])

  const rtn: SettingsT[] = new Array<SettingsT>();
  for (let i: number = 0; i < inputCategories.values.length; i++) {
    rtn.push(
      Object.fromEntries(
        settingNames.map(settingName => {
          return [
            settingName,
            extractSetting((inputCategories.objects ? inputCategories.objects[i] : null) as powerbi.DataViewObjects,
                            name, settingName, inputSettings[name][settingName])
          ]
        })
      ) as SettingsT
    )
  }
  return rtn
}

export default extractConditionalFormatting
