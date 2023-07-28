import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewCategorical = powerbi.DataViewCategorical;
import settingsClass from "../Classes/settingsClass";
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils"
import defaultSettings, { defaultSettingsType, defaultSettingsKey } from "../defaultSettings";

type SettingsTypes = defaultSettingsType[defaultSettingsKey];

export default function extractConditionalFormatting(categoricalView: DataViewCategorical, name: string, inputSettings: settingsClass): SettingsTypes[] {
  const inputCategories: DataViewCategoryColumn = (categoricalView.categories as DataViewCategoryColumn[])[0];
  const settingNames = Object.getOwnPropertyNames(inputSettings[name]);

  return inputCategories.values.map((_, idx) => {
    return Object.fromEntries(
      settingNames.map(settingName => {
        return [
          settingName,
          dataViewObjects.getCommonValue(
            (inputCategories.objects ? inputCategories.objects[idx] : null) as powerbi.DataViewObjects,
            { objectName: name, propertyName: settingName },
            defaultSettings[name][settingName]
          )
        ]
      })
    ) as SettingsTypes
  });
}
