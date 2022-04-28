import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;

class plotData {
  x: number;
  ratio: number;
  colour: string;
  // ISelectionId allows the visual to report the selection choice to PowerBI
  identity: ISelectionId;
  // Flag for whether dot should be highlighted by selections in other charts
  highlighted: boolean;
  // Tooltip data to print
  tooltips: VisualTooltipDataItem[];
  tick_labels: (number|string)[];

  constructor(args: { empty: boolean }) {
    if (args.empty) {
      this.x = null;
      this.ratio = null;
      this.colour = null;
      this.identity = null;
      this.highlighted = null;
      this.tooltips = [null];
      this.tick_labels = [null];
    }
  }
};

export default plotData;
