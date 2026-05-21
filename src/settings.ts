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

const settingsKeys: settingsModelKeys[] = Object.keys(settingsModel) as settingsModelKeys[];

type settingScalarType = string | number | boolean | undefined;
const defaultValuesArray = new Array<(string | settingsValueTypesUnion)[]>(settingsKeys.length);
for (let i = 0; i < settingsKeys.length; i++) {
  const key: string = settingsKeys[i];
  const settingNames: string[] = (settingsModel[key] as any).settingNames;
  const curr_card = new Array<[string, settingScalarType]>(settingNames.length);

  for (let j = 0; j < settingNames.length; j++) {
    const setting: string = settingNames[j];
    curr_card[j] = [setting, settingsModel[key][setting]["default"]];
  }
  defaultValuesArray[i] = [key, Object.fromEntries(curr_card) as settingsValueTypesUnion];
}

const defaultSettings: settingsValueType = Object.fromEntries(defaultValuesArray) as settingsValueType;
const defaultSettingsString: string = JSON.stringify(defaultSettings);

export { defaultSettings, defaultSettingsString, settingsValueType, settingsValueTypesUnion };
export default settingsModel;
