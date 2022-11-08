import * as d3 from "d3";
import { a3 } from "../Functions/Constants";
import rep from "../Functions/rep";
import { sqrt } from "../Functions/UnaryFunctions"
import { pow, subtract, add, multiply, divide } from "../Functions/BinaryFunctions";
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";
import plotKey from "../Type Definitions/plotKey";

function xbarLimits(inputData: dataObject): controlLimits {
  let groups: string[] = inputData.groups;
  let numerators: number[] = inputData.numerators;
    // Get the unique groupings to summarise
  let unique_group_names: string[] = groups.filter(
    (value, index, self) => self.indexOf(value) === index
  );

  // Get the unique groupings to summarise
  let unique_groups: plotKey[] = unique_group_names.map((group_name, idx) => {
    return { x: idx, id: idx, label: group_name }
  });


  // Calculate number of observations in each group
  let count_per_group: number[] = unique_groups.map(
    unique_group => groups.filter(group => group === unique_group.label).length
  );

  // Append date and value arrays so that the values can be filtered by their
  //   associated date
  let rbind_arrays: (string | number)[][] = numerators.map((d,idx) => [groups[idx],d]);

  // Calculate the mean for each group
  let group_means: number[] = unique_groups.map(
    unique_group => d3.mean(rbind_arrays.filter(array_obs => array_obs[0] === unique_group.label).map(d3 => <number>d3[1]))
  );

  // Calculate the SD for each group
  let group_sd: number[] = sqrt(unique_groups.map(
    unique_group => d3.variance(rbind_arrays.filter(array_obs => array_obs[0] == unique_group.label).map(d3 => <number>d3[1]))));

  // Per-group sample size minus 1
  let Nm1: number[] = subtract(count_per_group, 1);

  // Calculate weighted SD
  let sd: number = sqrt(d3.sum(multiply(Nm1,pow(group_sd,2))) / d3.sum(Nm1));

  // Calculated weighted mean (for centreline)
  let cl: number = d3.sum(multiply(count_per_group, group_means)) / d3.sum(count_per_group);

  // Sample-size dependent constant
  let A3: number[] = a3(count_per_group);

  return new controlLimits({
    keys: unique_groups,
    values: group_means,
    targets: rep(cl, unique_groups.length),
    ll99: subtract(cl, multiply(A3, sd)),
    ll95: subtract(cl, multiply(multiply(divide(A3, 3), 2), sd)),
    ul95: add(cl, multiply(multiply(divide(A3, 3), 2), sd)),
    ul99: add(cl, multiply(A3, sd)),
    count: count_per_group
  })
}

export default xbarLimits;
