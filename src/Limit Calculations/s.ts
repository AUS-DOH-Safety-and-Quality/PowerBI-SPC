import * as d3 from "d3";
import * as rmath from "lib-r-math.js";
import { b3, b4 } from "./Constants";
import { subtract, sqrt, pow } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function s_limits(value: number[], group: string[]): ControlLimits {
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

    // Calculate the SD for each group
    let group_sd: number[] = sqrt(unique_groups.map(
        d => d3.variance(rbind_arrays.filter(d2 => d2[0] == d).map(d3 => <number>d3[1]))));

    // Per-group sample size minus 1
    let Nm1: number[] = subtract(count_per_group, 1);

    // Calculate weighted SD
    let cl: number = sqrt(d3.sum(rmath.R.mult(Nm1,pow(group_sd,2))) / d3.sum(Nm1));

    // Sample-size dependent constant (function above)
    let B3: number[] = b3(count_per_group);
    let B4: number[] = b4(count_per_group);

    let limits: ControlLimits = {
        key: unique_groups,
        value: group_sd,
        centerline: cl,
        lowerLimit: rmath.R.mult(cl, B3),
        upperLimit: rmath.R.mult(cl, B4),
        count: count_per_group
    }
    return limits;
}

export default s_limits;
