import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import chartObject from "./chartObject"
import settingsObject from "./settingsObject";
import dataObject from "./dataObject";
import lineData from "./lineData"
import controlLimits from "../Type Definitions/controlLimits";
import plotData from "./plotData"
import checkInvalidDataView from "../Functions/checkInvalidDataView"

type nestReturnT = {
  key: string;
  values: any;
  value: undefined;
}

class viewModelObject {
  inputData: dataObject;
  inputSettings: settingsObject;
  chartBase: chartObject;
  calculatedLimits: controlLimits;
  plotPoints: plotData[];
  groupedLines: nestReturnT[];
  anyHighlights: boolean;

  getPlotData(): plotData[] {
    let plotPoints = new Array<plotData>();
    for (let i: number = 0; i < this.calculatedLimits.keys.length; i++) {
      let index: number = this.calculatedLimits.keys[i].id;
      plotPoints.push({
        x: index,
        value: this.calculatedLimits.values[i],
        colour: this.inputSettings.scatter.colour.value,
        identity: null,
        highlighted: this.inputData.highlights ? (this.inputData.highlights[index] ? true : false) : false,
        tooltip: [],
        tick_label: {x: i, label: this.calculatedLimits.keys[i].label}
      })
    }
    return plotPoints;
  }

  getGroupedLines(): nestReturnT[] {
    let multiplier: number = this.inputData.multiplier;
    let colours = {
      l99: this.inputSettings.lines.colour_99.value,
      l95: this.inputSettings.lines.colour_95.value,
      u95: this.inputSettings.lines.colour_95.value,
      u99: this.inputSettings.lines.colour_99.value,
      targets: this.inputSettings.lines.colour_target.value,
      main: this.inputSettings.lines.colour_main.value
    }
    let widths = {
      l99: this.inputSettings.lines.width_99.value,
      l95: this.inputSettings.lines.width_95.value,
      u95: this.inputSettings.lines.width_95.value,
      u99: this.inputSettings.lines.width_99.value,
      target: this.inputSettings.lines.width_target.value,
      main: this.inputSettings.lines.width_main.value
    }

    let labels: string[] = ["ll99", "ll95", "ul95", "ul99", "target", "main"];

    let formattedLines: lineData[] = new Array<lineData>();
    let nLimits = this.calculatedLimits.keys.length;
    for (let i: number = 0; i < nLimits; i++) {
      labels.forEach(label => {
        formattedLines.push({
          x: this.calculatedLimits.keys[i].id,
          line_value: this.calculatedLimits.values[i],
          group: label,
          colour: colours[label],
          width: widths[label]
        })
      })
    }
    return d3.nest<lineData>()
              .key(function(d: lineData) { return d.group; })
              .entries(formattedLines)
  }

  constructor(args: { options: VisualUpdateOptions;
                      inputSettings: settingsObject;
                      host: IVisualHost; }) {
    let dv: powerbi.DataView[] = args.options.dataViews;
    if (checkInvalidDataView(dv)) {
      this.inputData = new dataObject({});
      this.inputSettings = args.inputSettings;
      this.chartBase = null;
      this.calculatedLimits = null;
      this.plotPoints = [new plotData({ empty: true })];
      this.groupedLines = [{ key: null, value: null, values: new lineData() }];
      this.anyHighlights = null;
      return;
    }

    this.inputData = new dataObject({ inputView: dv[0].categorical,
                                      inputSettings: args.inputSettings})
    this.inputSettings = args.inputSettings;
    this.anyHighlights = this.inputData.highlights ? true : false;
    this.chartBase = new chartObject({ inputData: this.inputData,
                                        inputSettings: this.inputSettings});
    this.calculatedLimits = this.chartBase.getLimits();
    this.plotPoints = this.getPlotData();
    this.groupedLines = this.getGroupedLines();
  }
}

export default viewModelObject