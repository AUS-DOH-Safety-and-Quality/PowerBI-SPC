import type powerbi from "powerbi-visuals-api"
type DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
import type { defaultSettingsType, defaultSettingsKey } from "../Classes";
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils"
import defaultSettings from "../defaultSettings";
import rep from "./rep";
import between from "./between";

type SettingsTypes = defaultSettingsType[defaultSettingsKey];
export type SettingsValidationT = { status: number, messages: string[][], error?: string };
export type ConditionalReturnT<T extends SettingsTypes> = { values: T[], validation: SettingsValidationT }

export default function
  extractConditionalFormatting<T extends SettingsTypes>(categoricalView: DataViewCategorical,
                                                        settingGroupName: string,
                                                        inputSettings: defaultSettingsType): ConditionalReturnT<T> {
  if (categoricalView === null) {
    return { values: null, validation: { status: 0, messages: rep(new Array<string>(), 1) } };
  }
  if ((categoricalView.categories === null) || (categoricalView.categories === undefined)) {
    return { values: null, validation: { status: 0, messages: rep(new Array<string>(), 1) } };
  }
  const inputCategories: DataViewCategoryColumn = (categoricalView.categories as DataViewCategoryColumn[])[0];
  const settingNames = Object.keys(inputSettings[settingGroupName]);

  // Force a deep copy to avoid JS's absurd pass-by-reference handling
  const validationRtn: SettingsValidationT
    = JSON.parse(JSON.stringify({ status: 0, messages: rep([], inputCategories.values.length) }));


  const rtn = inputCategories.values.map((_, idx) => {
    const inpObjects = (inputCategories.objects ? inputCategories.objects[idx] : null) as powerbi.DataViewObjects;
    return Object.fromEntries(
      settingNames.map(settingName => {
        const defaultSetting = defaultSettings[settingGroupName][settingName]["default"];

        let extractedSetting = dataViewObjects.getCommonValue(
          inpObjects,
          { objectName: settingGroupName, propertyName: settingName },
          defaultSettings[settingGroupName][settingName]["default"]
        );
        // PBI passes empty string when clearing conditional formatting
        // for dropdown setting using the eraser button, so just reset to default
        extractedSetting = extractedSetting === "" ? defaultSetting : extractedSetting;

        const valid = defaultSettings[settingGroupName][settingName]?.["valid"];
        if (valid) {
          let message: string = "";
          if (valid instanceof Array && !valid.includes(extractedSetting)) {
            message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are: ${valid.join(", ")}`
          } else if (valid.numberRange && !between(extractedSetting, valid.numberRange.min, valid.numberRange.max)) {
            message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are between ${valid.numberRange.min} and ${valid.numberRange.max}`
          }
          if (message !== "") {
            extractedSetting = defaultSettings[settingGroupName][settingName]["default"];
            validationRtn.messages[idx].push(message);
          }
        }
        return [ settingName, extractedSetting ];
      })
    ) as SettingsTypes
  }) as T[];

  const validationMessages = validationRtn.messages.filter(d => d.length > 0);
  if (!validationRtn.messages.some(d => d.length === 0)) {
    validationRtn.status = 1;
    validationRtn.error = `${validationMessages[0][0]}`;
  }

  return { values: rtn, validation: validationRtn };
}
