import { astronomical, trend, two_in_three, shift } from "../Outlier Flagging"
import { rep, checkFlagDirection, truncate, type truncateInputs, multiply, repIfScalar } from "../Functions"
import { type settingsClass } from "../Classes";

type controlLimitsArgs = {
  inputSettings: settingsClass,
  keys: { x: number, id: number, label: string }[];
  values: number[];
  numerators?: number[];
  denominators?: number[];
  targets: number[] | number;
  ll99?: number[] | number;
  ll95?: number[] | number;
  ul95?: number[] | number;
  ul99?: number[] | number;
  count?: number[];
}

export default class controlLimitsClass {
  [key: string] : any;
  keys: { x: number, id: number, label: string }[];
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

  scaleAndTruncateLimits(inputSettings: settingsClass): void {
    // Scale limits using provided multiplier
    const multiplier: number = inputSettings.spc.multiplier;

    ["values", "targets", "alt_targets", "ll99", "ll95", "ul95", "ul99"].forEach(limit => {
      this[limit] = multiply(this[limit], multiplier)
    })

    if (inputSettings.spc.chart_type === "run") {
      return;
    }

    const limits: truncateInputs = {
      lower: inputSettings.spc.ll_truncate,
      upper: inputSettings.spc.ul_truncate
    };

    ["ll99", "ll95", "ul95", "ul99"].forEach(limit => {
      this[limit] = truncate(this[limit], limits);
    });
  }

  flagOutliers(inputSettings: settingsClass) {
    const process_flag_type: string = inputSettings.outliers.process_flag_type;
    const improvement_direction: string = inputSettings.outliers.improvement_direction;
    if (inputSettings.spc.chart_type !== "run") {
      if (inputSettings.outliers.astronomical) {
        this.astpoint = checkFlagDirection(astronomical(this.values, this.ll99, this.ul99),
                                            { process_flag_type, improvement_direction });
      }
      if (inputSettings.outliers.two_in_three) {
        this.two_in_three = checkFlagDirection(two_in_three(this.values, this.ll95, this.ul95),
                                                { process_flag_type, improvement_direction });
      }
    }
    if (inputSettings.outliers.trend) {
      this.trend = checkFlagDirection(trend(this.values, inputSettings.outliers.trend_n),
                                      { process_flag_type, improvement_direction });
    }
    if (inputSettings.outliers.shift) {
      this.shift = checkFlagDirection(shift(this.values, this.targets, inputSettings.outliers.shift_n),
                                      { process_flag_type, improvement_direction });
    }
  }

  constructor(args: controlLimitsArgs) {
    this.keys = args.keys;
    this.values = args.values;
    this.numerators = args?.numerators
    this.denominators = args?.denominators
    this.count = args?.count

    this.targets = repIfScalar(args.targets, args.values.length);
    this.ll99 = repIfScalar(args.ll99, args.values.length);
    this.ll95 = repIfScalar(args.ll95, args.values.length);
    this.ul95 = repIfScalar(args.ul95, args.values.length);
    this.ul99 = repIfScalar(args.ul99, args.values.length);
    this.alt_targets = rep(args.inputSettings.spc.alt_target, args.values.length)

    this.astpoint = rep("none", args.values.length);
    this.trend = rep("none", args.values.length);
    this.two_in_three = rep("none", args.values.length);
    this.shift = rep("none", args.values.length);

    this.scaleAndTruncateLimits(args.inputSettings)
    this.flagOutliers(args.inputSettings)
  }
}
