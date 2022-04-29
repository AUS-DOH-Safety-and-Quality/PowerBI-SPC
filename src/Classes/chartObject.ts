import * as limitFunctions from "../Limit Calculations"
import dataObject from "./dataObject";
import settingsObject from "./settingsObject";
import controlLimits from "../Type Definitions/controlLimits";

type chartObjectConstructor = {
  inputData: dataObject;
  inputSettings: settingsObject;
}

class chartObject {
  inputData: dataObject;
  inputSettings: settingsObject;
  limitFunction: (x: dataObject) => controlLimits;

  getLimits(): controlLimits {
    return this.limitFunction(this.inputData);
  }

  constructor(args: chartObjectConstructor) {
    this.inputData = args.inputData;
    this.inputSettings = args.inputSettings;

    this.limitFunction = limitFunctions[args.inputData.chart_type]
  }
}

export default chartObject;
