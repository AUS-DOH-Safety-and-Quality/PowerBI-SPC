import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;

interface measureIndex {
    numerator: number,
    denominator: number,
    chart_type: number,
    chart_multiplier: number
}

interface groupedData {
    x: number,
    value: number,
    group: string
};

interface nestArray {
    key: string;
    values: number;
    value: number;
}

// Used to represent the different datapoints on the chart
interface PlotData {
    x: number,
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
    lineData: groupedData[];
    minLimit: number;
    maxLimit: number;
    highlights: boolean;
    groupedLines: nestArray[];
    data_type: string;
    multiplier: number;
};

interface ToolTips {
    displayName: string;
    value: string;
}




export { PlotData }
export { ViewModel }
export { ToolTips }
export { groupedData }
export { nestArray }
export { measureIndex }
