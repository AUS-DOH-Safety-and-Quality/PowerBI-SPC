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
import { addGetters, type SettingDefaultTypes } from "./Settings Model/common";

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
}

// Add custom getters to each settings class so that individual settings can be
//   accessed directly - ignoring the intermediate settingsGroups layer:
//   - e.g. settings.spc.chart_type rather than settings.spc.settingsGroups.all.chart_type
const settingsModel = {
  canvas: addGetters(canvasSettings),
  spc: addGetters(spcSettings),
  outliers: addGetters(outliersSettings),
  nhs_icons: addGetters(nhsIconsSettings),
  scatter: addGetters(scatterSettings),
  lines: addGetters(linesSettings),
  x_axis: addGetters(xAxisSettings),
  y_axis: addGetters(yAxisSettings),
  dates: addGetters(datesSettings),
  summary_table: addGetters(summaryTableSettings),
  download_options: addGetters(downloadSettings),
  labels: addGetters(labelsSettings),

  get defaultValues(): settingsValueType {
    let ret = {} as RecursivePartial<settingsValueType>;
    for (const key in this) {
      if (key === "defaultValues") continue; // to avoid infinite loop
      const currSettings = this[key as settingsModelKeys];
      const currSettingNames: string[] = currSettings.settingNames;
      ret[key as settingsModelKeys] = {};
      for (const setting of currSettingNames) {
        (ret as any)[key as settingsModelKeys][setting] = (currSettings as any)[setting].default;
      }
    }
    return ret as settingsValueType;
  }
};

/**
 * Majority of below for temporary compatibility with older code
 * for the new settings structure, to be cleaned up in future refactor
 */

type settingsModelType = Omit<typeof settingsModel, "defaultValues">;
type settingsModelKeys = keyof settingsModelType;

type settingsValueType = {
  [K in settingsModelKeys]: SettingDefaultTypes<settingsModelType[K]>
}
type settingsValueTypesUnion = settingsValueType[settingsModelKeys];

const defaultSettings: settingsValueType = settingsModel.defaultValues;

export { defaultSettings, settingsValueType, settingsValueTypesUnion };
export default settingsModel;
