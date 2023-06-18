import * as limitFunctions from "../Limit Calculations"
import dataObject from "./dataObject";
import settingsObject from "./settingsObject";
import controlLimits from "./controlLimits";
import { multiply } from "../Functions/BinaryFunctions";
import truncate from "../Functions/truncate"
import rep from "../Functions/rep"

type chartObjectConstructor = {
  inputData: dataObject;
  inputSettings: settingsObject;
  splitIndexes: number[];
}

class chartObject {
  inputData: dataObject;
  inputSettings: settingsObject;
  splitIndexes: number[];
  limitFunction: (x: dataObject) => controlLimits;

  getLimits(): controlLimits {
    let calcLimits: controlLimits;

    if (this.splitIndexes.length > 0) {
      const indexes: number[] = this.splitIndexes
                                  .concat([this.inputData.keys.length - 1])
                                  .sort((a,b) => a - b);
      const groupedData: dataObject[] = indexes.map((d, idx) => {
        // Force a deep copy
        const data: dataObject = JSON.parse(JSON.stringify(this.inputData));
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

      const calcLimitsGrouped: controlLimits[] = groupedData.map(d => this.limitFunction(d));
      calcLimits = calcLimitsGrouped.reduce((all: controlLimits, curr: controlLimits) => {
        const allInner: controlLimits = all;
        Object.entries(all).forEach((entry, idx) => {
          if (this.inputSettings.spc.chart_type.value !== "run" || !["ll99", "ll95", "ul95", "ul99"].includes(entry[0])) {
            allInner[entry[0] as keyof controlLimits] = entry[1].concat(Object.entries(curr)[idx][1]);
          }
        })
        return allInner;
      })
    } else {
      // Calculate control limits using user-specified type
      calcLimits = this.limitFunction(this.inputData);
    }

    calcLimits.flagOutliers(this.inputSettings);

    // Scale limits using provided multiplier
    const multiplier: number = this.inputSettings.spc.multiplier.value;

    calcLimits.values = multiply(calcLimits.values, multiplier);
    calcLimits.targets = multiply(calcLimits.targets, multiplier);
    calcLimits.alt_targets = rep(this.inputSettings.spc.alt_target.value, calcLimits.values.length)

    if (this.inputSettings.spc.chart_type.value !== "run") {
      const limits: Record<string, number> = {
        lower: this.inputSettings.y_axis.ylimit_l.value,
        upper: this.inputSettings.y_axis.ylimit_u.value
      }
      calcLimits.ll99 = truncate(multiply(calcLimits.ll99, multiplier), limits);
      calcLimits.ll95 = truncate(multiply(calcLimits.ll95, multiplier), limits);
      calcLimits.ul95 = truncate(multiply(calcLimits.ul95, multiplier), limits);
      calcLimits.ul99 = truncate(multiply(calcLimits.ul99, multiplier), limits);
    }
    return calcLimits;
  }

  constructor(args: chartObjectConstructor) {
    this.inputData = args.inputData;
    this.inputSettings = args.inputSettings;
    this.splitIndexes = args.splitIndexes;

    this.limitFunction = limitFunctions[args.inputSettings.spc.chart_type.value as keyof typeof limitFunctions]
  }
}

export default chartObject;
