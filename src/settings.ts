import canvasSettings from "./Settings Model/canvasSettings";
import spcSettings from "./Settings Model/spcSettings";
import outliersSettings from "./Settings Model/outliersSettings";
import nhsIconsSettings from "./Settings Model/nhsIconsSettings";
import scatterSettings from "./Settings Model/scatterSettings";
import linesSettings from "./Settings Model/linesSettings";
import xAxisSettings from "./Settings Model/xAxisSettings";
import yAxisSettings from "./Settings Model/yAxisSettings";
import datesSettings from "./Settings Model/datesSettings";
import summaryTableSettings from "./Settings Model/summaryTableSettings";
import downloadSettings from "./Settings Model/downloadSettings";
import labelsSettings from "./Settings Model/labelsSettings";

const settingsModel = {
  canvas: canvasSettings,
  spc: spcSettings,
  outliers: outliersSettings,
  nhs_icons: nhsIconsSettings,
  scatter: scatterSettings,
  lines: linesSettings,
  x_axis: xAxisSettings,
  y_axis: yAxisSettings,
  dates: datesSettings,
  summary_table: summaryTableSettings,
  download_options: downloadSettings,
  labels: labelsSettings
};

/**
 * Majority of below for temporary compatibility with older code
 * for the new settings structure, to be cleaned up in future refactor
 */

type settingsModelType = typeof settingsModel;
type settingsModelKeys = keyof settingsModelType;

type MergeUnions<T> = (T extends any ? (x: T) => void : never) extends (x: infer R) => void
  ? { [K in keyof R]: R[K] }
  : never;

type settingsGroups<T> = Extract<keyof T, "settingsGroups">;
type settingsGroupMembers<T> = MergeUnions<T[settingsGroups<T>][keyof T[settingsGroups<T>]]>;
type DefaultTypes<T> = T[Extract<keyof T, "default">];

export type NestedKeysOf<T>
  = T extends object
    ? { [K in keyof T]: K extends string ? K : never; }[keyof T]
    : never;

export type settingsValueType = {
  [K in settingsModelKeys]: {
    [L in keyof settingsGroupMembers<settingsModelType[K]>]: DefaultTypes<settingsGroupMembers<settingsModelType[K]>[L]>
  }
}
export type defaultSettingsKeys = keyof settingsValueType;
export type defaultSettingsNestedKeys = NestedKeysOf<settingsValueType[defaultSettingsKeys]>;


const settingsModelClone = JSON.parse(JSON.stringify(settingsModel));

for (const key in settingsModelClone) {
  let settingNames: string[] = [];
  for (const group in settingsModelClone[key].settingsGroups) {
    for (const setting in settingsModelClone[key].settingsGroups[group]) {
      settingNames.push(setting);
      Object.defineProperty(settingsModelClone[key], setting, {
        get: function() {
          return this.settingsGroups[group][setting]
        }
      });
    }
  }
  Object.defineProperty(settingsModelClone[key], "settingNames", {
    get: function() {
      return settingNames;
    }
  });
}

type settingScalarType = string | number | boolean | undefined;

Object.defineProperty(settingsModelClone, "defaultValues", {
  get: function(): settingsValueType {
    const defaultValuesArray: (string | settingsValueType[defaultSettingsKeys])[][] = new Array<(string | settingsValueType[defaultSettingsKeys])[]>();
    for (const key in this) {
      if (this[key].settingNames) {
        let currSettingsDefaults: (settingScalarType)[][] = new Array<(settingScalarType)[]>();
        this[key].settingNames.forEach((setting: string) => {
          currSettingsDefaults.push([setting, this[key][setting].default as settingScalarType]);
        });
        defaultValuesArray.push([key, Object.fromEntries(currSettingsDefaults) as settingsValueType[defaultSettingsKeys]]);
      }
    }
    return Object.fromEntries(defaultValuesArray) as settingsValueType;
  }
})


const defaultSettings = settingsModelClone.defaultValues as settingsValueType;

Object.freeze(settingsModelClone);
Object.freeze(defaultSettings);

export { defaultSettings, settingsModelClone }
export default settingsModel;
