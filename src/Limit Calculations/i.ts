import * as d3 from "d3";
import diff from "../Functions/diff"
import rep from "../Functions/rep";
import { abs } from "../Functions/UnaryFunctions"
import { divide } from "../Functions/BinaryFunctions";
import dataObject from "../Classes/dataObject";
import controlLimits from "../Classes/controlLimits";

function iLimits(inputData: dataObject): controlLimits {
  const useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  const cl: number = d3.mean(ratio);

  const consec_diff: number[] = abs(diff(ratio));
  const consec_diff_ulim: number = d3.mean(consec_diff) * 3.267;
  const consec_diff_valid: number[] = consec_diff.filter(d => d < consec_diff_ulim);

  const sigma: number = d3.mean(consec_diff_valid) / 1.128;

  return new controlLimits({
    keys: inputData.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    numerators: useRatio ? inputData.numerators : undefined,
    denominators: useRatio ? inputData.denominators : undefined,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(cl - 3 * sigma, inputData.keys.length),
    ll95: rep(cl - 2 * sigma, inputData.keys.length),
    ul95: rep(cl + 2 * sigma, inputData.keys.length),
    ul99: rep(cl + 3 * sigma, inputData.keys.length)
  });
}

export default iLimits;
