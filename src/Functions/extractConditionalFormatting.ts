import type powerbi from "powerbi-visuals-api"
type DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
type DataViewObjects = powerbi.DataViewObjects;
type Fill = powerbi.Fill;
import {
  default as settingsModel, defaultSettings, type settingsValueTypesUnion,
  type settingsValueType, type SettingsValueKeys, type SettingsValueNestedKeys, type settingsValueTypesMerged
} from "../settings";
import rep from "./rep";
import between from "./between";
import isNullOrUndefined from "./isNullOrUndefined";
import getNested from "./getNested"

export type SettingsValidationT = { status: number, messages: string[][], error?: string };
export type ConditionalReturnT<T extends settingsValueTypesUnion> = { values: T[] | undefined, validation: SettingsValidationT }

function getSettingValue<T>(settingObject: DataViewObjects, settingGroup: string, settingName: string, defaultValue: T): T {
  const propertyValue: powerbi.DataViewPropertyValue = settingObject?.[settingGroup]?.[settingName];
  if (isNullOrUndefined(propertyValue)) {
    return defaultValue;
  }
  return ((<Fill>propertyValue)?.solid?.color ?? propertyValue) as T;
}

export default function
  extractConditionalFormatting<T extends settingsValueTypesUnion>(categoricalView: DataViewCategorical,
                                                        settingGroupName: string,
                                                        inputSettings: settingsValueType,
                                                        idxs: number[]): ConditionalReturnT<T> {
  if (isNullOrUndefined(categoricalView?.categories)) {
    return { values: undefined, validation: { status: 0, messages: rep(new Array<string>(), 1) } };
  }
  if (categoricalView?.categories?.[0]?.identity?.length === 0) {
    return { values: undefined, validation: { status: 0, messages: rep(new Array<string>(), 1) } };
  }
  const inputCategories: DataViewCategoryColumn = (categoricalView.categories as DataViewCategoryColumn[])[0];
  const settingNames = Object.keys(inputSettings[settingGroupName as keyof settingsValueType]);

  const settingSpecs = new Array<{
    settingName: SettingsValueNestedKeys;
    defaultSetting: settingsValueTypesMerged[SettingsValueNestedKeys];
    valid: string[] | { minValue?: { value: number }; maxValue?: { value: number }; } | undefined;
    defaultIsUndefined: boolean;
  }>(settingNames.length);
  for (let j = 0; j < settingNames.length; j++) {
    const settingName = settingNames[j] as SettingsValueNestedKeys;
    const defaultSetting = getNested(defaultSettings, settingGroupName as SettingsValueKeys, settingName);
    const settingEntry = getNested(settingsModel, settingGroupName as SettingsValueKeys, settingName);
    const valid = "valid" in settingEntry ? settingEntry.valid : "options" in settingEntry ? settingEntry.options : undefined;
    settingSpecs[j] = { settingName, defaultSetting, valid, defaultIsUndefined: isNullOrUndefined(defaultSetting) };
  }

  const n: number = idxs.length;
  const validationRtn: SettingsValidationT = { status: 0, messages: new Array<string[]>(n) };
  const rtn: T[] = new Array<T>(n);
  let allInvalid = n > 0;
  let defaultFormatting: { values: T; messages: string[] } | undefined;
  for (let i = 0; i < n; i++) {
    const inpObjects = inputCategories.objects ? inputCategories.objects[idxs[i]] : null;
    const usesDefaults = !inpObjects?.[settingGroupName];
    if (usesDefaults && defaultFormatting) {
      rtn[i] = { ...defaultFormatting.values };
      validationRtn.messages[i] = defaultFormatting.messages.slice();
      if (defaultFormatting.messages.length === 0) allInvalid = false;
      continue;
    }
    const messages: string[] = [];
    validationRtn.messages[i] = messages;
    const row = {} as T;
    for (let j = 0; j < settingSpecs.length; j++) {
      const { settingName, defaultSetting, valid, defaultIsUndefined } = settingSpecs[j];
      let extractedSetting = getSettingValue(inpObjects!, settingGroupName, settingName, defaultSetting);
      // Power BI uses an empty string when clearing conditional formatting.
      extractedSetting = extractedSetting === "" ? defaultSetting : extractedSetting;
      if (valid && !defaultIsUndefined) {
        let message = "";
        if (valid instanceof Array) {
          if (!valid.includes(extractedSetting as string)) {
            message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are: ${valid.join(", ")}`;
          }
        } else if ((!isNullOrUndefined(valid.minValue) || !isNullOrUndefined(valid.maxValue)) && !between(extractedSetting, valid.minValue?.value, valid.maxValue?.value)) {
          message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are between ${valid.minValue?.value} and ${valid.maxValue?.value}`;
        }
        if (message !== "") {
          extractedSetting = defaultSetting;
          messages.push(message);
        }
      }
      row[settingName as keyof T] = extractedSetting as T[keyof T];
    }
    if (usesDefaults) defaultFormatting = { values: row, messages };
    rtn[i] = row;
    if (messages.length === 0) allInvalid = false;
  }

  if (allInvalid) {
    validationRtn.status = 1;
    validationRtn.error = validationRtn.messages[0][0];
  }

  return { values: rtn as T[] | undefined, validation: validationRtn };
}
