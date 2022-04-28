import * as d3 from "d3";
import { b3, b4 } from "../Functions/Constants";
import rep from "../Functions/rep";
import { sqrt } from "../Function Broadcasting/UnaryFunctions";
import { subtract, pow, multiply, divide } from "../Function Broadcasting/BinaryFunctions";
import controlLimits from "../Type Definitions/controlLimits";
import dataObject from "../Classes/dataObject";
import plotKey from "../Type Definitions/plotKey";

function sLimits(inputData: dataObject): controlLimits {
  let groups: string[] = inputData.groups;
  let numerators: number[] = inputData.numerators;
  // Get the unique groupings to summarise
  let unique_group_names: string[] = groups.filter(
    (value, index, self) => self.indexOf(value) === index
  );

  let unique_groups: plotKey[] = unique_group_names.map((group_name, idx) => {
    return {id: idx, label: group_name}
  });

  // Calculate number of observations in each group
  let count_per_group: number[] = unique_groups.map(
    unique_group => groups.filter(group => group === unique_group.label).length
  );

  // Append date and value arrays so that the values can be filtered by their
  //   associated date
  let rbind_arrays: (string | number)[][] = numerators.map((d,idx) => [groups[idx],d]);

  // Calculate the SD for each group
  let group_sd: number[] = sqrt(unique_groups.map(
    unique_group => d3.variance(rbind_arrays.filter(array_obs => array_obs[0] == unique_group.label).map(d3 => <number>d3[1]))));

  // Per-group sample size minus 1
  let Nm1: number[] = subtract(count_per_group, 1);

  // Calculate weighted SD
  let cl: number = sqrt(d3.sum(multiply(Nm1,pow(group_sd,2))) / d3.sum(Nm1));

  // Sample-size dependent constant
  let B3: number[] = b3(count_per_group);
  let B4: number[] = b4(count_per_group);

  return {
    keys: unique_groups,
    values: group_sd,
    targets: rep(cl, unique_groups.length),
    ll99: multiply(cl, B3),
    ll95: multiply(cl, multiply(divide(B3, 3), 2)),
    ul95: multiply(cl, multiply(divide(B4, 3), 2)),
    ul99: multiply(cl, B4)
  }
}

export default sLimits;
