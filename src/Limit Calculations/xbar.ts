import * as d3 from "d3";
import * as rmath from "lib-r-math.js";
import { a3 } from "./Constants";
import { sqrt } from "./HelperFunctions";
import { pow } from "./HelperFunctions";
import { subtract } from "./HelperFunctions";

function xbar_limits(value: number[], group: string[]) {
    // Get the unique groupings to summarise
    let unique_groups: string[] = group.filter(
        (value, index, self) => self.indexOf(value) === index
    );

    // Calculate number of observations in each group
    let count_per_group: number[] = unique_groups.map(
        d => group.filter(d2 => d2 == d).length
    );
    
    // Append date and value arrays so that the values can be filtered by their
    //   associated date
    let rbind_arrays: (string | number)[][] = value.map((d,idx) => [group[idx],d]);

    // Calculate the mean for each group
    let group_means: number[] = unique_groups.map(
        d => d3.mean(rbind_arrays.filter(d2 => d2[0] == d).map(d3 => <number>d3[1]))
    );

    // Calculate the SD for each group
    let group_sd: number[] = sqrt(unique_groups.map(
        d => d3.variance(rbind_arrays.filter(d2 => d2[0] == d).map(d3 => <number>d3[1]))));

    // Per-group sample size minus 1
    let Nm1: number[] = subtract(count_per_group, 1);

    // Calculate weighted SD
    let sd: number = sqrt(d3.sum(rmath.R.mult(Nm1,pow(group_sd,2))) / d3.sum(Nm1));

    // Calculated weighted mean (for centreline)
    let cl: number = d3.sum(rmath.R.mult(count_per_group, group_means)) / d3.sum(count_per_group);

    // Sample-size dependent constant
    let A3: number[] = a3(count_per_group);

    return unique_groups.map((d,idx) => [d,
                                         group_means[idx],
                                         cl,
                                         cl - A3[idx]*sd,
                                         cl + A3[idx]*sd,
                                         count_per_group[idx]]);
}

export default xbar_limits;
