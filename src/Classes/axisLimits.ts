import * as d3 from "d3";
import controlLimits from "../Type Definitions/controlLimits"
import settingsObject from "./settingsObject";
import dataObject from "./dataObject"

class axisLimits {
  x: {
    lower: number,
    upper: number,
    padding: number
  };
  y: {
    lower: number,
    upper: number,
    padding: number
  }

  constructor(args: { inputData?: dataObject,
                      inputSettings?: settingsObject,
                      calculatedLimits?: controlLimits,
                      empty?: boolean }) {
    if (args.empty) {
      this.x = {lower: null, upper: null, padding: null};
      this.y = {lower: null, upper: null, padding: null};
      return;
    }
    let chart_type: string = args.inputData.chart_type;
    let values: number[] = args.calculatedLimits.values;
    let ul99: number[] = args.calculatedLimits.ul99;
    let ll99: number[] = args.calculatedLimits.ll99;
    let maxValueOrLimit: number = d3.max(values.concat(ul99));
    let minValueOrLimit: number = d3.min(values.concat(ll99));
    let xLowerInput: number = args.inputSettings.axis.xlimit_l.value;
    let xUpperInput: number = args.inputSettings.axis.xlimit_u.value;
    let yLowerInput: number = args.inputSettings.axis.ylimit_l.value;
    let yUpperInput: number = args.inputSettings.axis.ylimit_u.value;
    let multiplier: number = args.inputData.multiplier;
    let upperLimit: number = ["p", "pp"].includes(chart_type) ? 1 : (maxValueOrLimit + Math.abs(maxValueOrLimit) * 0.25);
    let lowerLimit: number = ["p", "pp"].includes(chart_type) ? 0 : (minValueOrLimit - Math.abs(minValueOrLimit) * 0.25)

    this.x = {
      lower: xLowerInput ? xLowerInput : 0,
      upper: xUpperInput ? xUpperInput : d3.max(args.calculatedLimits.keys.map(d => d.x)),
      padding: args.inputSettings.axispad.x.padding.value
    };

    this.y = {
      lower: yLowerInput ? yLowerInput : lowerLimit,
      upper: yUpperInput ? yUpperInput : upperLimit,
      padding: args.inputSettings.axispad.y.padding.value
    };
  }
}

export default axisLimits;
