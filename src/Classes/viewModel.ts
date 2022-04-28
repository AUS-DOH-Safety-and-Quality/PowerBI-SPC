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
import buildTooltip from "../Functions/buildTooltip"

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
        tooltip: buildTooltip({date: this.calculatedLimits.keys[i].label,
                                value: this.calculatedLimits.values[i],
                                target: this.calculatedLimits.targets[i],
                                limits: {
                                  ll99: this.calculatedLimits.ll99[i],
                                  ul99: this.calculatedLimits.ul99[i]
                                },
                                chart_type: this.inputData.chart_type,
                                multiplier: this.inputData.multiplier,
                                prop_labels: ["p", "pp"].includes(this.inputData.chart_type)}),
        tick_label: {x: i, label: this.calculatedLimits.keys[i].label}
      })
    }
    return plotPoints;
  }

  getGroupedLines(): nestReturnT[] {
    let multiplier: number = this.inputData.multiplier;
    let colours = {
      ll99: this.inputSettings.lines.colour_99.value,
      ll95: this.inputSettings.lines.colour_95.value,
      ul95: this.inputSettings.lines.colour_95.value,
      ul99: this.inputSettings.lines.colour_99.value,
      targets: this.inputSettings.lines.colour_target.value,
      values: this.inputSettings.lines.colour_main.value
    }
    let widths = {
      ll99: this.inputSettings.lines.width_99.value,
      ll95: this.inputSettings.lines.width_95.value,
      ul95: this.inputSettings.lines.width_95.value,
      ul99: this.inputSettings.lines.width_99.value,
      targets: this.inputSettings.lines.width_target.value,
      values: this.inputSettings.lines.width_main.value
    }

    let labels: string[] = ["ll99", "ll95", "ul95", "ul99", "targets", "values"];

    let formattedLines: lineData[] = new Array<lineData>();
    let nLimits = this.calculatedLimits.keys.length;
    console.log(this.calculatedLimits)
    for (let i: number = 0; i < nLimits; i++) {
      labels.forEach(label => {
        formattedLines.push({
          x: this.calculatedLimits.keys[i].id,
          line_value: this.calculatedLimits[label][i],
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
    console.log("vm constructor")
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

    console.log("invalid data checked")
    this.inputData = new dataObject({ inputView: dv[0].categorical,
                                      inputSettings: args.inputSettings})
    console.log("input data extracted")
    this.inputSettings = args.inputSettings;
    this.anyHighlights = this.inputData.highlights ? true : false;
    console.log("settings extracted")
    this.chartBase = new chartObject({ inputData: this.inputData,
                                        inputSettings: this.inputSettings});
    console.log("chart object initialised")
    this.calculatedLimits = this.chartBase.getLimits();
    this.plotPoints = this.getPlotData();
    this.plotPoints.forEach((point, idx) => {
      point.identity = args.host
                            .createSelectionIdBuilder()
                            .withCategory(this.inputData.categories,
                                            this.inputData.keys[idx].id)
                            .createSelectionId()
    })
    this.groupedLines = this.getGroupedLines();
  }
}

export default viewModelObject