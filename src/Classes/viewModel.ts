import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import chartObject from "./chartObject"
import settingsObject from "./settingsObject";
import dataObject from "./dataObject";
import lineData from "./lineData"
import controlLimits from "./controlLimits";
import plotData from "./plotData"
import checkInvalidDataView from "../Functions/checkInvalidDataView"
import buildTooltip from "../Functions/buildTooltip"
import plotPropertiesClass from "./plotProperties"
import getAesthetic from "../Functions/getAesthetic"

class viewModelObject {
  inputData: dataObject;
  inputSettings: settingsObject;
  chartBase: chartObject;
  calculatedLimits: controlLimits;
  plotPoints: plotData[];
  groupedLines: [string, lineData[]][];
  tickLabels: { x: number; label: string; }[];
  plotProperties: plotPropertiesClass;
  splitIndexes?: number[];
  firstRun: boolean;

  initialisePlotData(host: IVisualHost): void {
    this.plotPoints = new Array<plotData>();
    this.tickLabels = new Array<{ x: number; label: string; }>();

    for (let i: number = 0; i < this.calculatedLimits.keys.length; i++) {
      let index: number = this.calculatedLimits.keys[i].x;
      let dot_colour: string = this.inputSettings.scatter.colour.value;
      if (this.calculatedLimits.shift[i] !== "none") {
        dot_colour = getAesthetic(this.calculatedLimits.shift[i], "outliers",
                                  "shift_colour", this.inputSettings) as string;
      }
      if (this.calculatedLimits.trend[i] !== "none") {
        dot_colour = getAesthetic(this.calculatedLimits.trend[i], "outliers",
                                  "trend_colour", this.inputSettings) as string;
      }
      if (this.calculatedLimits.two_in_three[i] !== "none") {
        dot_colour = getAesthetic(this.calculatedLimits.two_in_three[i], "outliers",
                                  "two_in_three_colour", this.inputSettings) as string;
      }
      if (this.calculatedLimits.astpoint[i] !== "none") {
        dot_colour = getAesthetic(this.calculatedLimits.astpoint[i], "outliers",
                                  "ast_colour", this.inputSettings) as string;
      }

      this.plotPoints.push({
        x: index,
        value: this.calculatedLimits.values[i],
        colour: dot_colour,
        identity: host.createSelectionIdBuilder()
                      .withCategory(this.inputData.categories,
                                    this.inputData.keys[i].id)
                      .createSelectionId(),
        highlighted: this.inputData.highlights ? (this.inputData.highlights[index] ? true : false) : false,
        tooltip: buildTooltip(i, this.calculatedLimits, this.inputData, this.inputSettings)
      })
      this.tickLabels.push({x: index, label: this.calculatedLimits.keys[i].label});
    }
  }

  initialiseGroupedLines(): void {
    let labels: string[] = ["ll99", "ll95", "ul95", "ul99", "targets", "values", "alt_targets"];

    let formattedLines: lineData[] = new Array<lineData>();
    let nLimits = this.calculatedLimits.keys.length;

    for (let i: number = 0; i < nLimits; i++) {
      labels.forEach(label => {
        // By adding an additional null line value at each re-baseline point
        // we avoid rendering a line joining each segment
        if (this.chartBase.splitIndexes.includes(i - 1)) {
          formattedLines.push({
            x: this.calculatedLimits.keys[i].x,
            line_value: null,
            group: label
          })
        }
        formattedLines.push({
          x: this.calculatedLimits.keys[i].x,
          line_value: this.calculatedLimits[label] ? this.calculatedLimits[label][i] : null,
          group: label
        })
      })
    }
    this.groupedLines = d3.groups(formattedLines, d => d.group);
  }

  update(args: { options: VisualUpdateOptions;
                  host: IVisualHost; }) {
    // Make sure that the construction returns early with null members so
    // that the visual does not crash when trying to process invalid data
    if (checkInvalidDataView(args.options.dataViews)) {
      this.inputData = <dataObject>null;
      this.inputSettings = <settingsObject>null;
      this.chartBase = null;
      this.calculatedLimits = null;
      this.plotPoints = <plotData[]>null;
      this.groupedLines = <[string, lineData[]][]>null;
      this.plotProperties = <plotPropertiesClass>null;
      return;
    }

    let dv: powerbi.DataView[] = args.options.dataViews;

    if (this.firstRun) {
      this.inputSettings = new settingsObject();
    }
    // Only re-construct data and settings objects (and re-calculate limits) if they have changed
    if (args.options.type === 2 || this.firstRun) {
      this.inputSettings.update(args.options.dataViews[0].metadata.objects);

      // Extract input data, filter out invalid values, and identify any settings passed as data
      this.inputData = new dataObject(dv[0].categorical, this.inputSettings)


      // Initialise a new chartObject class which can be used to calculate the control limits
      this.chartBase = new chartObject({ inputData: this.inputData,
                                          inputSettings: this.inputSettings,
                                          splitIndexes: this.splitIndexes ? this.splitIndexes : new Array<number>() });

      // Use initialised chartObject to calculate control limits
      this.calculatedLimits = this.chartBase.getLimits();
      console.log("calculatedLimits: ", this.calculatedLimits)

      // Structure the data and calculated limits to the format needed for plotting
      this.initialisePlotData(args.host);
      this.initialiseGroupedLines();
    }

    if (this.firstRun) {
      this.plotProperties = new plotPropertiesClass();
      this.plotProperties.firstRun = true;
    }
    this.plotProperties.update({
      options: args.options,
      plotPoints: this.plotPoints,
      calculatedLimits: this.calculatedLimits,
      inputData: this.inputData,
      inputSettings: this.inputSettings
    })
    this.firstRun = false;
  }
}

export default viewModelObject
