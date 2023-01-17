import rep from "../Functions/rep";
import plotKey from "./plotKey"
import astronomical from "../Outlier Flagging/astronomical"
import trend from "../Outlier Flagging/trend"
import two_in_three from "../Outlier Flagging/two_in_three"
import shift from "../Outlier Flagging/shift"
import settingsObject from "./settingsObject";
import dataObject from "./dataObject";

type controlLimitsArgs = {
  keys: plotKey[];
  values: number[];
  numerators?: number[];
  denominators?: number[];
  targets: number[];
  alt_targets?: number[];
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
  alt_targets?: number[];
  ll99: number[];
  ll95: number[];
  ul95: number[];
  ul99: number[];
  count?: number[];
  astpoint: string[];
  trend: string[];
  two_in_three: string[];
  shift: string[];
  split_indexes?: number[];

  flagOutliers(inputData: dataObject, inputSettings: settingsObject) {
    let flag_direction: string = inputData.flag_direction;
    if (inputData.chart_type !== "run") {
      if (inputSettings.outliers.astronomical.value) {
        this.astpoint = astronomical(this.values, this.ll99, this.ul99).map(d => {
          if (flag_direction !== "both") {
            return (d === flag_direction) ? d : "none"
          } else {
            return d
          }
        });
      }
      if (inputSettings.outliers.two_in_three.value) {
        this.two_in_three = two_in_three(this.values, this.ll95, this.ul95).map(d => {
          if (flag_direction !== "both") {
            return (d === flag_direction) ? d : "none"
          } else {
            return d
          }
        });
      }
    }
    if (inputSettings.outliers.trend.value) {
      this.trend = trend(this.values, inputSettings.outliers.trend_n.value).map(d => {
        if (flag_direction !== "both") {
          return (d === flag_direction) ? d : "none"
        } else {
          return d
        }
      });
    }
    if (inputSettings.outliers.shift.value) {
      this.shift = shift(this.values, this.targets, inputSettings.outliers.shift_n.value).map(d => {
        if (flag_direction !== "both") {
          return (d === flag_direction) ? d : "none"
        } else {
          return d
        }
      });
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
    this.astpoint = rep("none", args.values.length);
    this.trend = rep("none", args.values.length);
    this.two_in_three = rep("none", args.values.length);
    this.shift = rep("none", args.values.length);
    if (args.count || !(args.count === null || args.count === undefined)) {
      this.count = args.count;
    }
  }
}

export default controlLimits
