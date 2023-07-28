import { min as d3min, max as d3max } from "d3-array";

/**
 * D3 Array reduction functions have return type number | undefined,
 * redefine these to remove the 'undefined' as that is handled separately
 */
const min = (x: number[]): number => d3min(x) as number;
const max = (x: number[]): number => d3max(x) as number;

export { select, selectAll, Selection, BaseType } from "d3-selection";
export { groups, leastIndex, mean, median, sum } from "d3-array";
export { min, max };
export { line } from "d3-shape"
export { Axis, axisBottom, axisLeft } from "d3-axis"
export { ScaleLinear, scaleLinear, NumberValue } from "d3-scale"
