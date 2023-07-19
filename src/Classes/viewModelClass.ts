import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataViewPropertyValue = powerbi.DataViewPropertyValue;
import DataViewObject = powerbi.DataViewObject;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;
import settingsClass from "./settingsClass";
import dataClass from "./dataClass";
import controlLimitsClass from "./controlLimitsClass";
import checkInvalidDataView from "../Functions/checkInvalidDataView"
import buildTooltip from "../Functions/buildTooltip"
import plotPropertiesClass from "./plotPropertiesClass"
import getAesthetic from "../Functions/getAesthetic"
import { defaultSettingsType } from "./defaultSettings";
import * as limitFunctions from "../Limit Calculations"

class lineData {
  x: number;
  line_value: number;
  group: string;
}

class plotData {
  x: number;
  value: number;
  aesthetics: defaultSettingsType["scatter"];
  // ISelectionId allows the visual to report the selection choice to PowerBI
  identity: ISelectionId;
  // Flag for whether dot should be highlighted by selections in other charts
  highlighted: boolean;
  // Tooltip data to print
  tooltip: VisualTooltipDataItem[];
}

type LimitArgs = { inputData: dataClass; inputSettings: settingsClass; }

class viewModelClass {
  inputData: dataClass;
  inputSettings: settingsClass;
  controlLimits: controlLimitsClass;
  plotPoints: plotData[];
  groupedLines: [string, lineData[]][];
  tickLabels: { x: number; label: string; }[];
  plotProperties: plotPropertiesClass;
  splitIndexes: number[];
  firstRun: boolean;
  limitFunction: (x: LimitArgs) => controlLimitsClass;

  update(args: { options: VisualUpdateOptions; host: IVisualHost; }) {
    if (this.firstRun) {
      this.inputSettings = new settingsClass();
    }
    const dv: powerbi.DataView[] = args.options.dataViews;
    this.inputSettings.update(dv[0]);

    let split_indexes_storage: DataViewObject = dv[0].metadata.objects ? dv[0].metadata.objects.split_indexes_storage : null;
    let split_indexes: DataViewPropertyValue = split_indexes_storage ? split_indexes_storage.split_indexes : null;
    this.splitIndexes = split_indexes ? JSON.parse(<string>(split_indexes)) : new Array<number>();

    // Make sure that the construction returns early with null members so
    // that the visual does not crash when trying to process invalid data
    if (checkInvalidDataView(dv)) {
      this.inputData = <dataClass>null;
      this.limitFunction = null;
      this.controlLimits = null;
      this.plotPoints = <plotData[]>null;
      this.groupedLines = <[string, lineData[]][]>null;
      this.splitIndexes = new Array<number>();
    } else {

      // Only re-construct data and re-calculate limits if they have changed
      if (args.options.type === 2 || this.firstRun) {

        // Extract input data, filter out invalid values, and identify any settings passed as data
        this.inputData = new dataClass(dv[0].categorical, this.inputSettings)

        // Initialise a new chartObject class which can be used to calculate the control limits
        this.limitFunction = limitFunctions[this.inputSettings.spc.chart_type as keyof typeof limitFunctions]

        // Use initialised chartObject to calculate control limits
        this.calculateLimits();
        this.controlLimits.scaleLimits(this.inputSettings);
        this.controlLimits.truncateLimits(this.inputSettings);
        console.log("calculatedLimits: ", this.controlLimits)

        // Structure the data and calculated limits to the format needed for plotting
        this.initialisePlotData(args.host);
        this.initialiseGroupedLines();
      }
    }
    if (this.firstRun) {
      this.plotProperties = new plotPropertiesClass();
      this.plotProperties.firstRun = true;
    }
    this.plotProperties.update({
      options: args.options,
      plotPoints: this.plotPoints,
      controlLimits: this.controlLimits,
      inputData: this.inputData,
      inputSettings: this.inputSettings
    })
    this.firstRun = false;
  }

  calculateLimits(): void {
    if (this.splitIndexes.length > 0) {
      const indexes: number[] = this.splitIndexes
                                  .concat([this.inputData.keys.length - 1])
                                  .sort((a,b) => a - b);
      const groupedData: dataClass[] = indexes.map((d, idx) => {
        // Force a deep copy
        const data: dataClass = JSON.parse(JSON.stringify(this.inputData));
         if(idx === 0) {
          data.denominators = data.denominators.slice(0, d + 1)
          data.numerators = data.numerators.slice(0, d + 1)
          data.keys = data.keys.slice(0, d + 1)
         } else {
          data.denominators = data.denominators.slice(indexes[idx - 1] + 1, d + 1)
          data.numerators = data.numerators.slice(indexes[idx - 1] + 1, d + 1)
          data.keys = data.keys.slice(indexes[idx - 1] + 1, d + 1)
         }
        return data;
      })

      const calcLimitsGrouped: controlLimitsClass[] = groupedData.map(d => this.limitFunction({inputData: d, inputSettings: this.inputSettings}));
      this.controlLimits = calcLimitsGrouped.reduce((all: controlLimitsClass, curr: controlLimitsClass) => {
        const allInner: controlLimitsClass = all;
        Object.entries(all).forEach((entry, idx) => {
          if (this.inputSettings.spc.chart_type !== "run" || !["ll99", "ll95", "ul95", "ul99"].includes(entry[0])) {
            allInner[entry[0] as keyof controlLimitsClass] = entry[1].concat(Object.entries(curr)[idx][1]);
          }
        })
        return allInner;
      })
    } else {
      // Calculate control limits using user-specified type
      this.controlLimits = this.limitFunction({inputData: this.inputData, inputSettings: this.inputSettings});
    }
  }

  initialisePlotData(host: IVisualHost): void {
    this.plotPoints = new Array<plotData>();
    this.tickLabels = new Array<{ x: number; label: string; }>();

    for (let i: number = 0; i < this.controlLimits.keys.length; i++) {
      const index: number = this.controlLimits.keys[i].x;
      const aesthetics: defaultSettingsType["scatter"] = this.inputData.scatter_formatting[i]
      if (this.controlLimits.shift[i] !== "none") {
        aesthetics.colour = getAesthetic(this.controlLimits.shift[i], "outliers",
                                  "shift_colour", this.inputSettings) as string;
      }
      if (this.controlLimits.trend[i] !== "none") {
        aesthetics.colour = getAesthetic(this.controlLimits.trend[i], "outliers",
                                  "trend_colour", this.inputSettings) as string;
      }
      if (this.controlLimits.two_in_three[i] !== "none") {
        aesthetics.colour = getAesthetic(this.controlLimits.two_in_three[i], "outliers",
                                  "two_in_three_colour", this.inputSettings) as string;
      }
      if (this.controlLimits.astpoint[i] !== "none") {
        aesthetics.colour = getAesthetic(this.controlLimits.astpoint[i], "outliers",
                                  "ast_colour", this.inputSettings) as string;
      }

      this.plotPoints.push({
        x: index,
        value: this.controlLimits.values[i],
        aesthetics: aesthetics,
        identity: host.createSelectionIdBuilder()
                      .withCategory(this.inputData.categories,
                                    this.inputData.keys[i].id)
                      .createSelectionId(),
        highlighted: this.inputData.highlights ? (this.inputData.highlights[index] ? true : false) : false,
        tooltip: buildTooltip(i, this.controlLimits, this.inputData, this.inputSettings)
      })
      this.tickLabels.push({x: index, label: this.controlLimits.keys[i].label});
    }
  }

  initialiseGroupedLines(): void {
    const labels: string[] = ["ll99", "ll95", "ul95", "ul99", "targets", "values", "alt_targets"];

    const formattedLines: lineData[] = new Array<lineData>();
    const nLimits = this.controlLimits.keys.length;

    for (let i: number = 0; i < nLimits; i++) {
      labels.forEach(label => {
        // By adding an additional null line value at each re-baseline point
        // we avoid rendering a line joining each segment
        if (this.splitIndexes.includes(i - 1)) {
          formattedLines.push({
            x: this.controlLimits.keys[i].x,
            line_value: null,
            group: label
          })
        }
        formattedLines.push({
          x: this.controlLimits.keys[i].x,
          line_value: this.controlLimits[label] ? this.controlLimits[label][i] : null,
          group: label
        })
      })
    }
    this.groupedLines = d3.groups(formattedLines, d => d.group);
  }

  constructor(from?: viewModelClass) {
    if (from) {
      this.inputData = from.inputData;
      this.inputSettings = from.inputSettings;
      this.controlLimits = from.controlLimits;
      this.plotPoints = from.plotPoints;
      this.groupedLines = from.groupedLines;
      this.tickLabels = from.tickLabels;
      this.plotProperties = from.plotProperties;
      this.splitIndexes = from.splitIndexes;
      this.firstRun = from.firstRun;
      this.limitFunction = from.limitFunction;
    } else {
      this.inputData = <dataClass>null;
      this.inputSettings = <settingsClass>null;
      this.limitFunction = null;
      this.controlLimits = null;
      this.plotPoints = <plotData[]>null;
      this.groupedLines = <[string, lineData[]][]>null;
      this.plotProperties = <plotPropertiesClass>null;
      this.firstRun = true
      this.splitIndexes = new Array<number>();
    }
  }
}

export { lineData, plotData, LimitArgs }
export default viewModelClass
