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

// Add custom getters to each settings class so that individual settings can be
//   accessed directly - ignoring the intermediate settingsGroups layer:
//   - e.g. settings.spc.chart_type rather than settings.spc.settingsGroups.all.chart_type
for (const key in settingsModel) {
  let settingNames: string[] = [];
  for (const group in settingsModel[key].settingsGroups) {
    for (const setting in settingsModel[key].settingsGroups[group]) {
      settingNames.push(setting);
      Object.defineProperty(settingsModel[key], setting, {
        get: function() {
          return this.settingsGroups[group][setting]
        }
      });
    }
  }
  Object.defineProperty(settingsModel[key], "settingNames", {
    get: function() {
      return settingNames;
    }
  });
}

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

type settingsValueType = {
  [K in settingsModelKeys]: {
    [L in keyof settingsGroupMembers<settingsModelType[K]>]: DefaultTypes<settingsGroupMembers<settingsModelType[K]>[L]>
  }
}
type settingsValueTypesUnion = settingsValueType[settingsModelKeys];

Object.defineProperty(settingsModel, "defaultValues", {
  get: function() {
    let ret = {};
    for (const key in this) {
      const currSettings: string[] = this[key].settingNames;
      ret[key] = Object.fromEntries(currSettings.map(d => [d, this[key][d]["default"]]));
    }
    return ret as settingsValueType;
  }
})

const defaultSettings: settingsValueType = (settingsModel as any).defaultValues;

export { defaultSettings, settingsValueType, settingsValueTypesUnion };
export default settingsModel;
