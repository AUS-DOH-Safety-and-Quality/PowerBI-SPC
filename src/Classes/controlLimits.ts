import rep from "../Functions/rep";
import plotKey from "../Type Definitions/plotKey"

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
    if (args.count || !(args.count === null || args.count === undefined)) {
      this.count = args.count;
    }
  }
}

export default controlLimits
