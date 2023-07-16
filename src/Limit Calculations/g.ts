import * as d3 from "d3";
import { sqrt } from "../Functions/UnaryFunctions";
import rep from "../Functions/rep";
import dataClass from "../Classes/dataClass";
import controlLimitsClass from "../Classes/controlLimitsClass";
import { LimitArgs } from "../Classes/viewModelClass";

function gLimits(args: LimitArgs): controlLimitsClass {
  const inputData: dataClass = args.inputData;
  const cl: number = d3.mean(inputData.numerators);
  const sigma: number = sqrt(cl * (cl + 1));

  return new controlLimitsClass({
    keys: inputData.keys,
    values: inputData.numerators,
    targets: rep(d3.median(inputData.numerators), inputData.keys.length),
    ll99: rep(0, inputData.keys.length),
    ll95: rep(0, inputData.keys.length),
    ul95: rep(cl + 2*sigma, inputData.keys.length),
    ul99: rep(cl + 3*sigma, inputData.keys.length)
  });
}

export default gLimits;
