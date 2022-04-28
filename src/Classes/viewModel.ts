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
  }
}