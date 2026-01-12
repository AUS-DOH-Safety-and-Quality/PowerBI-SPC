import type powerbi from "powerbi-visuals-api"
type DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
type DataViewObjects = powerbi.DataViewObjects;
type Fill = powerbi.Fill;
import type { defaultSettingsType, defaultSettingsKeys } from "../Classes/settingsClass";
import { defaultSettings } from "../settings";
import rep from "./rep";
import between from "./between";
import isNullOrUndefined from "./isNullOrUndefined";

type SettingsTypes = defaultSettingsType[defaultSettingsKeys];
export type SettingsValidationT = { status: number, messages: string[][], error?: string };
export type ConditionalReturnT<T extends SettingsTypes> = { values: T[], validation: SettingsValidationT }

function getSettingValue<T>(settingObject: DataViewObjects, settingGroup: string, settingName: string, defaultValue: T): T {
  const propertyValue: powerbi.DataViewPropertyValue = settingObject?.[settingGroup]?.[settingName];
  if (isNullOrUndefined(propertyValue)) {
    return defaultValue;
  }
  return (<Fill>propertyValue)?.solid ? (<Fill>propertyValue).solid.color as T
                                      : propertyValue as T;
}

export default function
  extractConditionalFormatting<T extends SettingsTypes>(categoricalView: DataViewCategorical,
                                                        settingGroupName: string,
                                                        inputSettings: defaultSettingsType,
                                                        idxs: number[]): ConditionalReturnT<T> {
  if (isNullOrUndefined(categoricalView?.categories)) {
    return { values: null, validation: { status: 0, messages: rep(new Array<string>(), 1) } };
  }
  if (categoricalView?.categories?.[0]?.identity?.length === 0) {
    return { values: null, validation: { status: 0, messages: rep(new Array<string>(), 1) } };
  }
  const inputCategories: DataViewCategoryColumn = (categoricalView.categories as DataViewCategoryColumn[])[0];
  const settingNames = Object.keys(inputSettings[settingGroupName]);

  // Force a deep copy to avoid JS's absurd pass-by-reference handling
  const validationRtn: SettingsValidationT
    = JSON.parse(JSON.stringify({ status: 0, messages: rep([], inputCategories.values.length) }));
  const n: number = idxs.length;
  let rtn: T[] = new Array<T>(n);
  for (let i = 0; i < n; i++) {
    const inpObjects = inputCategories.objects ? inputCategories.objects[idxs[i]] : null;
    rtn[i] = Object.fromEntries(
      settingNames.map(settingName => {
        const defaultSetting = defaultSettings[settingGroupName][settingName]["default"];

        let extractedSetting = getSettingValue(inpObjects, settingGroupName, settingName, defaultSetting);
        // PBI passes empty string when clearing conditional formatting
        // for dropdown setting using the eraser button, so just reset to default
        extractedSetting = extractedSetting === "" ? defaultSetting : extractedSetting;

        // New API has numeric min/max under 'options' member
        const valid = defaultSettings[settingGroupName][settingName]?.["valid"] ?? defaultSettings[settingGroupName][settingName]?.["options"];
        const isNumericRange: boolean = !isNullOrUndefined(valid?.minValue) || !isNullOrUndefined(valid?.maxValue)
        if (valid) {
          let message: string = "";
          if (valid instanceof Array && !valid.includes(extractedSetting)) {
            message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are: ${valid.join(", ")}`
          } else if (isNumericRange && !between(extractedSetting, valid?.minValue?.value, valid?.maxValue?.value)) {
            message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are between ${valid?.minValue?.value} and ${valid?.maxValue?.value}`
          }
          if (message !== "") {
            extractedSetting = defaultSettings[settingGroupName][settingName]["default"];
            validationRtn.messages[i].push(message);
          }
        }
        return [ settingName, extractedSetting ];
      })
    ) as T
  }

  const validationMessages = validationRtn.messages.filter(d => d.length > 0);
  if (!validationRtn.messages.some(d => d.length === 0)) {
    validationRtn.status = 1;
    validationRtn.error = `${validationMessages[0][0]}`;
  }

  return { values: rtn, validation: validationRtn };
}
