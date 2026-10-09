import spcSettings from "./Settings Model/spcSettings";
import outliersSettings from "./Settings Model/outliersSettings";
import nhsIconsSettings from "./Settings Model/nhsIconsSettings";
import scatterSettings from "./Settings Model/scatterSettings";
import linesSettings from "./Settings Model/linesSettings";
import datesSettings from "./Settings Model/datesSettings";
import summaryTableSettings from "./Settings Model/summaryTableSettings";
import {
  createCanvasCard, createLabelsCard, createAxisCard, createDownloadCard, defineCard, createDefaultValues, numberOption,
  type SettingsValues
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
  download_options: createDownloadCard(),
  labels: createLabelsCard()
};

type settingsValueType = SettingsValues<typeof settingsModel>;

const defaultSettings = createDefaultValues(settingsModel);

export { defaultSettings, type settingsValueType };
export default settingsModel;
