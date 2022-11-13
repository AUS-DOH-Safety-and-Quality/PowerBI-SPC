import rep from "../Functions/rep";
import plotKey from "./plotKey"
import astronomical from "../Outlier Flagging/astronomical"
import trend from "../Outlier Flagging/trend"
import two_in_three from "../Outlier Flagging/two_in_three"
import shift from "../Outlier Flagging/shift"
import settingsObject from "./Settings/settingsObject";
import dataObject from "./dataObject";

type controlLimitsArgs = {
  keys: plotKey[];
  values: number[];
  numerators?: number[];
  denominators?: number[];
  targets: number[];
  ll99: number[];
  ll95: number[];
  ul95: number[];
  ul99: number[];
  count?: number[];
}

class controlLimits {
  keys: plotKey[];
  values: number[];
  numerators?: number[];
  denominators?: number[];
  targets: number[];
  ll99: number[];
  ll95: number[];
  ul95: number[];
  ul99: number[];
  count?: number[];
  astpoint: boolean[];
  trend: boolean[];
  two_in_three: boolean[];
  shift: boolean[];
  split_indexes?: number[];

  flagOutliers(inputData: dataObject, inputSettings: settingsObject) {
    if (inputData.chart_type !== "run") {
      if (inputSettings.outliers.astronomical.value) {
        this.astpoint = astronomical(inputData.flag_direction, this.values, this.ll99, this.ul99);
      }
      if (inputSettings.outliers.two_in_three.value) {
        this.two_in_three = two_in_three(inputData.flag_direction, this.values, this.ll95, this.ul95);
      }
    }
    if (inputSettings.outliers.trend.value) {
      this.trend = trend(inputData.flag_direction, this.values, inputSettings.outliers.trend_n.value);
    }
    if (inputSettings.outliers.shift.value) {
      this.shift = shift(inputData.flag_direction, this.values, this.targets, inputSettings.outliers.shift_n.value);
    }
  }

  constructor(args: controlLimitsArgs) {
    this.keys = args.keys;
    this.values = args.values;
    if (args.numerators || !(args.numerators === null || args.numerators === undefined)) {
      this.numerators = args.numerators;
    }
    if (args.denominators || !(args.denominators === null || args.denominators === undefined)) {
      this.denominators = args.denominators;
    }
    this.targets = args.targets;
    this.ll99 = args.ll99;
    this.ll95 = args.ll95;
    this.ul95 = args.ul95;
    this.ul99 = args.ul99;
    this.astpoint = rep(false, args.values.length);
    this.trend = rep(false, args.values.length);
    this.two_in_three = rep(false, args.values.length);
    this.shift = rep(false, args.values.length);
    if (args.count || !(args.count === null || args.count === undefined)) {
      this.count = args.count;
    }
  }
}

export default controlLimits
