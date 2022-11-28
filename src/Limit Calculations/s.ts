import * as d3 from "d3";
import { b3, b4 } from "../Functions/Constants";
import rep from "../Functions/rep";
import { sqrt } from "../Functions/UnaryFunctions";
import { subtract, pow, multiply, divide } from "../Functions/BinaryFunctions";
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";
import plotKey from "../Classes/plotKey";

function sLimits(inputData: dataObject): controlLimits {
  let group_sd: number[] = inputData.numerators;
  let count_per_group: number[] = inputData.denominators;

  // Per-group sample size minus 1
  let Nm1: number[] = subtract(count_per_group, 1);

  // Calculate weighted SD
  let cl: number = sqrt(d3.sum(multiply(Nm1,pow(group_sd,2))) / d3.sum(Nm1));

  // Sample-size dependent constant
  let B3: number[] = b3(count_per_group, false);
  let B395: number[] = b3(count_per_group, true);
  let B4: number[] = b4(count_per_group, false);
  let B495: number[] = b4(count_per_group, true);

  return new controlLimits({
    keys: inputData.keys,
    values: group_sd,
    targets: rep(cl, inputData.keys.length),
    ll99: multiply(cl, B3),
    ll95: multiply(cl, B395),
    ul95: multiply(cl, B495),
    ul99: multiply(cl, B4)
  });
}

export default sLimits;
