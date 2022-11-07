import * as limitFunctions from "../Limit Calculations"
import dataObject from "./dataObject";
import settingsObject from "./settingsObject";
import controlLimits from "./controlLimits";
import { multiply } from "../Function Broadcasting/BinaryFunctions";
import truncate from "../Functions/truncate"
import astronomical from "../Outlier Flagging/astronomical"
import trend from "../Outlier Flagging/trend"

type chartObjectConstructor = {
  inputData: dataObject;
  inputSettings: settingsObject;
}

class chartObject {
  inputData: dataObject;
  inputSettings: settingsObject;
  limitFunction: (x: dataObject) => controlLimits;

  flagOutliers(calcLimits: controlLimits): controlLimits {
    calcLimits.astpoint = astronomical(calcLimits.values, calcLimits.ll99, calcLimits.ul99);
    calcLimits.trend = trend(calcLimits.values, 5);
    return calcLimits;
  }

  getLimits(): controlLimits {
    let calcLimits: controlLimits;
    let rebaselineLimits: boolean;
    let split_vals: string[];

    if (this.inputSettings.spc.denom_split.value !== null) {
      let split_vals_raw: string[] = this.inputSettings.spc.denom_split.value.split(",")
      split_vals = split_vals_raw.filter(d => this.inputData.keys.map(d2 => d2.label).includes(d));
      rebaselineLimits = split_vals.length > 0;
    } else {
      rebaselineLimits = false;
    }

    if (rebaselineLimits) {
      let indexes: number[] = split_vals.map(d => this.inputData.keys.map(d2 => d2.label).indexOf(d))
                                        .concat([this.inputData.keys.length - 1])
                                        .sort((a,b) => a - b);

      let groupedData: dataObject[] = indexes.map((d, idx) => {
        // Force a deep copy
        let data = JSON.parse(JSON.stringify(this.inputData));
         if(idx === 0) {
          data.denominators = data.denominators.slice(0, d)
          data.numerators = data.numerators.slice(0, d)
          data.keys = data.keys.slice(0, d)
         } else {
          data.denominators = data.denominators.slice(indexes[idx - 1], d + 1)
          data.numerators = data.numerators.slice(indexes[idx - 1], d + 1)
          data.keys = data.keys.slice(indexes[idx - 1], d + 1)
         }
        return data;
      })

      let calcLimitsGrouped: controlLimits[] = groupedData.map(d => this.limitFunction(d));

      calcLimits = calcLimitsGrouped.reduce((all: controlLimits, curr: controlLimits) => {
        let allInner: controlLimits = all;
        Object.entries(all).forEach(entry => {
          allInner[entry[0]] = all[entry[0]].concat(curr[entry[0]]);
        })
        return allInner;
      })

    } else {
      // Calculate control limits using user-specified type
      calcLimits = this.limitFunction(this.inputData);
    }

    calcLimits = this.flagOutliers(calcLimits);

    // Scale limits using provided multiplier
    let multiplier: number = this.inputData.multiplier;
    calcLimits.values = multiply(calcLimits.values, multiplier);
    calcLimits.ll99 = truncate(multiply(calcLimits.ll99, multiplier),
                                this.inputData.limit_truncs);
    calcLimits.ll95 = truncate(multiply(calcLimits.ll95, multiplier),
                                this.inputData.limit_truncs);
    calcLimits.ul95 = truncate(multiply(calcLimits.ul95, multiplier),
                                this.inputData.limit_truncs);
    calcLimits.ul99 = truncate(multiply(calcLimits.ul99, multiplier),
                                this.inputData.limit_truncs);
    calcLimits.targets = multiply(calcLimits.targets, multiplier);

    console.log("inputData: ", this.inputData);
    console.log("calcLimits: ", calcLimits)
    return calcLimits;
  }

  constructor(args: chartObjectConstructor) {
    this.inputData = args.inputData;
    this.inputSettings = args.inputSettings;

    this.limitFunction = limitFunctions[args.inputData.chart_type]
  }
}

export default chartObject;
