import * as limitFunctions from "../Limit Calculations"
import dataObject from "./dataObject";
import settingsObject from "./settingsObject";
import controlLimits from "../Type Definitions/controlLimits";
import { multiply } from "../Function Broadcasting/BinaryFunctions";

type chartObjectConstructor = {
  inputData: dataObject;
  inputSettings: settingsObject;
}

class chartObject {
  inputData: dataObject;
  inputSettings: settingsObject;
  limitFunction: (x: dataObject) => controlLimits;

  getLimits(): controlLimits {
    // Calculate control limits using user-specified type
    let calcLimits: controlLimits = this.limitFunction(this.inputData);

    // Scale limits using provided multiplier
    let multiplier: number = this.inputData.multiplier;
    calcLimits.values = multiply(calcLimits.values, multiplier);
    calcLimits.ll99 = multiply(calcLimits.ll99, multiplier);
    calcLimits.ll95 = multiply(calcLimits.ll95, multiplier);
    calcLimits.ul95 = multiply(calcLimits.ul95, multiplier);
    calcLimits.ul99 = multiply(calcLimits.ul99, multiplier);
    calcLimits.targets = multiply(calcLimits.targets, multiplier);

    return calcLimits;
  }

  constructor(args: chartObjectConstructor) {
    this.inputData = args.inputData;
    this.inputSettings = args.inputSettings;

    this.limitFunction = limitFunctions[args.inputData.chart_type]
  }
}

export default chartObject;
