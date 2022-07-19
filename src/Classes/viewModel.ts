import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import chartObject from "./chartObject"
import settingsObject from "./settingsObject";
import dataObject from "./dataObject";
import lineData from "./lineData"
import controlLimits from "./controlLimits";
import plotData from "./plotData"
import checkInvalidDataView from "../Functions/checkInvalidDataView"
import buildTooltip from "../Functions/buildTooltip"
import axisLimits from "./axisLimits"

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
  axisLimits: axisLimits;
  displayPlot: boolean;
  percentLabels: boolean;
  tickLabels: { x: number; label: string; }[];

  getPlotData(): plotData[] {
    let plotPoints = new Array<plotData>();
    let tickLabels = new Array<{ x: number; label: string; }>();
    for (let i: number = 0; i < this.calculatedLimits.keys.length; i++) {
      let index: number = this.calculatedLimits.keys[i].x;
      plotPoints.push({
        x: index,
        value: this.calculatedLimits.values[i],
        colour: this.inputSettings.scatter.colour.value,
        identity: null,
        highlighted: this.inputData.highlights ? (this.inputData.highlights[index] ? true : false) : false,
        tooltip: buildTooltip({date: this.calculatedLimits.keys[i].label,
                                value: this.calculatedLimits.values[i],
                                numerator: this.calculatedLimits.numerators ? this.calculatedLimits.numerators[i] : null,
                                denominator: this.calculatedLimits.denominators ? this.calculatedLimits.denominators[i] : null,
                                target: this.calculatedLimits.targets[i],
                                limits: {
                                  ll99: this.calculatedLimits.ll99[i],
                                  ul99: this.calculatedLimits.ul99[i]
                                },
                                chart_type: this.inputData.chart_type,
                                multiplier: this.inputData.multiplier,
                                prop_labels: this.percentLabels})
      })
      tickLabels.push({x: index, label: this.calculatedLimits.keys[i].label});
    }
    this.tickLabels = tickLabels;
    return plotPoints;
  }

  getGroupedLines(): nestReturnT[] {
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

    for (let i: number = 0; i < nLimits; i++) {
      labels.forEach(label => {
        formattedLines.push({
          x: this.calculatedLimits.keys[i].x,
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

    let dv: powerbi.DataView[] = args.options.dataViews;
    console.log("before invalid")
    if (checkInvalidDataView(dv)) {
      this.inputData = new dataObject({empty: true});
      this.inputSettings = args.inputSettings;
      this.chartBase = null;
      this.calculatedLimits = null;
      this.plotPoints = [new plotData({ empty: true })];
      this.groupedLines = [{ key: null, value: null, values: new lineData() }];
      this.anyHighlights = null;
      this.axisLimits = new axisLimits({ empty: true })
      this.displayPlot = false
    console.log("after invalid - a")
      return;
    }
    console.log("after invalid - b")

    this.inputData = new dataObject({ inputView: dv[0].categorical,
                                      inputSettings: args.inputSettings})
    console.log("Initialised data")
    this.inputSettings = args.inputSettings;
    this.anyHighlights = this.inputData.highlights ? true : false;
    this.chartBase = new chartObject({ inputData: this.inputData,
                                        inputSettings: this.inputSettings});
    this.percentLabels = ["p", "pp"].includes(this.inputData.chart_type)
                            && this.inputData.multiplier == 1;
    console.log("Initialised chart")
    this.calculatedLimits = this.chartBase.getLimits();
    console.log(this.calculatedLimits)
    this.plotPoints = this.getPlotData();
    console.log("Got plot data")
    this.plotPoints.forEach((point, idx) => {
      point.identity = args.host
                            .createSelectionIdBuilder()
                            .withCategory(this.inputData.categories,
                                            this.inputData.keys[idx].id)
                            .createSelectionId()
    })
    this.groupedLines = this.getGroupedLines();
    console.log("Grouped lines for plotting")
    this.axisLimits = new axisLimits({ inputData: this.inputData,
                                        inputSettings: this.inputSettings,
                                        calculatedLimits: this.calculatedLimits });
    console.log("Made axis limits")
    this.displayPlot = this.plotPoints.length > 1;
  }
}

export default viewModelObject