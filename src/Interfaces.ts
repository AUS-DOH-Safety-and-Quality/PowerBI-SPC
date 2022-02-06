import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;


interface groupedData {
    x: number,
    value: number,
    group: string
};

interface nestArray {
    key: string;
    values: undefined;
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
    groupedLines: nestArray[]
};

interface ToolTips {
    displayName: string;
    value: string;
}

interface ControlLimits {
    key: string[];
    value: number[];
    centerline: number[];
    upperLimit99: number[];
    upperLimit95: number[];
    lowerLimit95: number[];
    lowerLimit99: number[];
    count: number[];
}


export { PlotData }
export { ViewModel }
export { ToolTips }
export { ControlLimits }
export { groupedData }
export { nestArray }
