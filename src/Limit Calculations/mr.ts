import * as d3 from "d3";
import diff from "../Functions/diff"
import rep from "../Functions/rep";
import { abs } from "../Functions/UnaryFunctions"
import {  divide } from "../Functions/BinaryFunctions";
import dataObject from "../Classes/dataObject";
import controlLimits from "../Classes/controlLimits";
import { LimitArgs } from "../Classes/chartObject";

function mrLimits(args: LimitArgs): controlLimits {
  const inputData: dataObject = args.inputData;
  const useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  const consec_diff: number[] = abs(diff(ratio));
  const cl: number = d3.mean(consec_diff);

  return new controlLimits({
    keys: inputData.keys,
    values: consec_diff,
    numerators: useRatio ? inputData.numerators : null,
    denominators: useRatio ? inputData.denominators : null,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(0, inputData.keys.length),
    ll95: rep(0, inputData.keys.length),
    ul95: rep((3.267 / 3) * 2 * cl, inputData.keys.length),
    ul99: rep(3.267 * cl, inputData.keys.length)
  });
}

export default mrLimits;
