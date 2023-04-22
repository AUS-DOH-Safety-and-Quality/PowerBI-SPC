import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewCategorical = powerbi.DataViewCategorical;
import settingsObject from "../Classes/settingsObject";
import {
  AllSettingsTypes
} from "../Classes/settingsGroups"
import extractSetting from "./extractSetting";


function extractConditionalFormatting<SettingsT extends AllSettingsTypes>(inputView: DataViewCategorical, name: string, inputSettings: settingsObject): SettingsT[] {
  let inputCategories: DataViewCategoryColumn = (inputView.categories as DataViewCategoryColumn[])[0];
  let staticSettings = inputSettings[name as keyof typeof inputSettings];
  let settingNames = Object.getOwnPropertyNames(staticSettings)

  let rtn: SettingsT[] = new Array<SettingsT>();
  for (let i: number = 0; i < inputCategories.values.length; i++) {
    rtn.push(
      Object.fromEntries(
        settingNames.map(settingName => {
          return [
            settingName,
            extractSetting((inputCategories.objects ? inputCategories.objects[i] : null) as powerbi.DataViewObjects,
                            name, settingName, staticSettings[settingName].default)
          ]
        })
      ) as SettingsT
    )
  }
  return rtn
}

export default extractConditionalFormatting
