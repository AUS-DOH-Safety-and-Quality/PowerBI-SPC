import spcSettings from "./Settings Model/spcSettings";
import outliersSettings from "./Settings Model/outliersSettings";
import nhsIconsSettings from "./Settings Model/nhsIconsSettings";
import scatterSettings from "./Settings Model/scatterSettings";
import linesSettings from "./Settings Model/linesSettings";
import datesSettings from "./Settings Model/datesSettings";
import summaryTableSettings from "./Settings Model/summaryTableSettings";
import downloadSettings from "./Settings Model/downloadSettings";
import {
  createCanvasCard, createLabelsCard, createAxisCard, defineCard, createDefaultValues, numberOption,
  type SettingsValues, type MergeUnions
} from "powerbi-visuals-core/settings";

const settingsModel = {
  canvas: createCanvasCard(),
  spc: defineCard(spcSettings),
  outliers: defineCard(outliersSettings),
  nhs_icons: defineCard(nhsIconsSettings),
  scatter: defineCard(scatterSettings),
  lines: defineCard(linesSettings),
  x_axis: createAxisCard("x", { tickRotation: -35 }),
  y_axis: createAxisCard("y", { tickRotation: 0 }, { limit_multiplier: numberOption("Axis Scaling Factor", 1.5, { min: 0 }) }),
  dates: defineCard(datesSettings),
  summary_table: defineCard(summaryTableSettings),
  download_options: defineCard(downloadSettings),
  labels: createLabelsCard()
};

type settingsModelType = typeof settingsModel;
type settingsModelKeys = keyof settingsModelType;
type settingsValueType = SettingsValues<settingsModelType>;
type settingsValueTypesUnion = settingsValueType[settingsModelKeys];

const defaultSettings = createDefaultValues(settingsModel);

type SettingsValueKeys = keyof settingsValueType;
type settingsValueTypesMerged = MergeUnions<settingsValueTypesUnion>;
type SettingsValueNestedKeys = keyof settingsValueTypesMerged;

export {
  defaultSettings, type settingsValueType, type settingsValueTypesUnion,
  type SettingsValueKeys, type SettingsValueNestedKeys, type settingsValueTypesMerged,
  type settingsModelKeys, type settingsModelType
};
export default settingsModel;
