import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;

type plotDataConstructor = {
  x?: number;
  value?: number;
  colour?: string;
  // ISelectionId allows the visual to report the selection choice to PowerBI
  identity?: ISelectionId;
  // Flag for whether dot should be highlighted by selections in other charts
  highlighted?: boolean;
  // Tooltip data to print
  tooltip?: VisualTooltipDataItem[];
  tick_label?: { x: number, label: string}
  empty?: boolean;
}

class plotData {
  x: number;
  value: number;
  colour: string;
  // ISelectionId allows the visual to report the selection choice to PowerBI
  identity: ISelectionId;
  // Flag for whether dot should be highlighted by selections in other charts
  highlighted: boolean;
  // Tooltip data to print
  tooltip: VisualTooltipDataItem[];

  constructor(args: plotDataConstructor) {
    if (args.empty) {
      this.x = null;
      this.value = null;
      this.colour = null;
      this.identity = null;
      this.highlighted = null;
      this.tooltip = [null];
      return;
    }

    this.x = args.x;
    this.value = args.value;
    this.colour = args.colour;
    this.identity = args.identity;
    this.highlighted = args.highlighted;
    this.tooltip = [];
  }
};

export default plotData;
