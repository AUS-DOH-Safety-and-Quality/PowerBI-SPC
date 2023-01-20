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

  getPlotData(host: IVisualHost): plotData[] {
    let plotPoints = new Array<plotData>();
    let tickLabels = new Array<{ x: number; label: string; }>();
    let shiftColourMap: { [key: string] : string } = {
      "upper" : this.inputSettings.outliers.shift_colour_upper.value,
      "lower" : this.inputSettings.outliers.shift_colour_lower.value
    };
    let trendColourMap: { [key: string] : string } = {
      "upper" : this.inputSettings.outliers.trend_colour_upper.value,
      "lower" : this.inputSettings.outliers.trend_colour_lower.value
    };
    let twoInThreeColourMap: { [key: string] : string } = {
      "upper" : this.inputSettings.outliers.twointhree_colour_upper.value,
      "lower" : this.inputSettings.outliers.twointhree_colour_lower.value
    };
    let astColourMap: { [key: string] : string } = {
      "upper" : this.inputSettings.outliers.ast_colour_upper.value,
      "lower" : this.inputSettings.outliers.ast_colour_lower.value
    };

    for (let i: number = 0; i < this.calculatedLimits.keys.length; i++) {
      let index: number = this.calculatedLimits.keys[i].x;
      let dot_colour: string = this.inputSettings.scatter.colour.value;
      if (this.calculatedLimits.shift[i] !== "none") {
        dot_colour = shiftColourMap[this.calculatedLimits.shift[i]];
      }
      if (this.calculatedLimits.trend[i] !== "none") {
        dot_colour = trendColourMap[this.calculatedLimits.trend[i]];
      }
      if (this.calculatedLimits.two_in_three[i] !== "none") {
        dot_colour = twoInThreeColourMap[this.calculatedLimits.two_in_three[i]];
      }
      if (this.calculatedLimits.astpoint[i] !== "none") {
        dot_colour = astColourMap[this.calculatedLimits.astpoint[i]];
      }

      plotPoints.push({
        x: index,
        value: this.calculatedLimits.values[i],
        colour: dot_colour,
        identity: host.createSelectionIdBuilder()
                      .withCategory(this.inputData.categories,
                                    this.inputData.keys[i].id)
                      .createSelectionId(),
        highlighted: this.inputData.highlights ? (this.inputData.highlights[index] ? true : false) : false,
        tooltip: buildTooltip({date: this.calculatedLimits.keys[i].label,
                                value: this.calculatedLimits.values[i],
                                numerator: this.calculatedLimits.numerators ? this.calculatedLimits.numerators[i] : null,
                                denominator: this.calculatedLimits.denominators ? this.calculatedLimits.denominators[i] : null,
                                target: this.calculatedLimits.targets[i],
                                limits: {
                                  ll99: this.calculatedLimits.ll99 ? this.calculatedLimits.ll99[i] : null,
                                  ul99: this.calculatedLimits.ll99 ? this.calculatedLimits.ul99[i] : null
                                },
                                chart_type: this.inputData.chart_type,
                                multiplier: this.inputData.multiplier,
                                prop_labels: this.inputData.percentLabels,
                               astpoint: this.calculatedLimits.astpoint[i],
                               trend: this.calculatedLimits.trend[i],
                               shift: this.calculatedLimits.shift[i],
                               two_in_three: this.calculatedLimits.two_in_three[i]},
                               this.inputSettings.spc.sig_figs.value)
      })
      tickLabels.push({x: index, label: this.calculatedLimits.keys[i].label});
    }
    this.tickLabels = tickLabels;
    return plotPoints;
  }

  getGroupedLines(): [string, lineData[]][] {
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
    return d3.groups(formattedLines, d => d.group);
  }

  update(args: { options: VisualUpdateOptions;
                  inputSettings: settingsObject;
                  host: IVisualHost; }) {
    // Make sure that the construction returns early with null members so
    // that the visual does not crash when trying to process invalid data
    if (checkInvalidDataView(args.options.dataViews)) {
      this.inputData = <dataObject>null;
      this.inputSettings = args.inputSettings;
      this.chartBase = null;
      this.calculatedLimits = null;
      this.plotPoints = <plotData[]>null;
      this.groupedLines = <[string, lineData[]][]>null;
      this.plotProperties = <plotPropertiesClass>null;
      return;
    }

    let dv: powerbi.DataView[] = args.options.dataViews;

    // Extract input data, filter out invalid values, and identify any settings passed as data
    this.inputData = new dataObject(dv[0].categorical, args.inputSettings)
    this.inputSettings = args.inputSettings;

    // Initialise a new chartObject class which can be used to calculate the control limits
    this.chartBase = new chartObject({ inputData: this.inputData,
                                        inputSettings: this.inputSettings,
                                        splitIndexes: this.splitIndexes ? this.splitIndexes : new Array<number>() });

    // Use initialised chartObject to calculate control limits
    this.calculatedLimits = this.chartBase.getLimits();
    console.log("calculatedLimits: ", this.calculatedLimits)

    // Structure the data and calculated limits to the format needed for plotting
    this.plotPoints = this.getPlotData(args.host);
    this.groupedLines = this.getGroupedLines();

    this.plotProperties = new plotPropertiesClass({
      options: args.options,
      plotPoints: this.plotPoints,
      calculatedLimits: this.calculatedLimits,
      inputData: this.inputData,
      inputSettings: this.inputSettings
    })
  }
}

export default viewModelObject
