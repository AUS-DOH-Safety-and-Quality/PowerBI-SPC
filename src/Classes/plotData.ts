import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;
import { SettingsBaseTypedT, scatterSettings } from "../Classes/settingsGroups";

class plotData {
  x: number;
  value: number;
  aesthetics: SettingsBaseTypedT<scatterSettings>;
  // ISelectionId allows the visual to report the selection choice to PowerBI
  identity: ISelectionId;
  // Flag for whether dot should be highlighted by selections in other charts
  highlighted: boolean;
  // Tooltip data to print
  tooltip: VisualTooltipDataItem[];
};

export default plotData;
