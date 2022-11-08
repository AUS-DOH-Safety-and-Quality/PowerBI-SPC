import * as d3 from "d3";
import { sqrt } from "../Functions/UnaryFunctions";
import rep from "../Functions/rep";
import dataObject from "../Classes/dataObject";
import controlLimits from "../Classes/controlLimits";

function gLimits(inputData: dataObject): controlLimits {
  let cl: number = d3.mean(inputData.numerators);
  let sigma: number = sqrt(cl * (cl + 1));

  return new controlLimits({
    keys: inputData.keys,
    values: inputData.numerators,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(0, inputData.keys.length),
    ll95: rep(0, inputData.keys.length),
    ul95: rep(cl + 2*sigma, inputData.keys.length),
    ul99: rep(cl + 3*sigma, inputData.keys.length)
  });
}

export default gLimits;
