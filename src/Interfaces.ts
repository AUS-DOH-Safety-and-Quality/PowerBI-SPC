import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;

// Used to represent the different datapoints on the chart
interface PlotData {
    x: number,
    lower_limit: number;
    upper_limit: number;
    ratio: number;
    colour: string;
    // ISelectionId allows the visual to report the selection choice to PowerBI
    identity: ISelectionId;
    // Flag for whether dot should be highlighted by selections in other charts
    highlighted: boolean;
    // Tooltip data to print
    tooltips: VisualTooltipDataItem[];
    tick_labels: (number|string)[];
};

// Separator between code that gets data from PBI, and code that renders
//   the data in the visual
interface ViewModel {
    plotData: PlotData[];
    minLimit: number;
    maxLimit: number;
    target: number;
    highlights: boolean;
};

interface ToolTips {
    displayName: string;
    value: string;
}

export { PlotData }
export { ViewModel }
export { ToolTips }
