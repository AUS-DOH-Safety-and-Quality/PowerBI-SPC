import * as d3 from "../D3 Plotting Functions/D3 Modules";
import powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import truncate from "../Functions/truncate";
import { type plotData } from "./viewModelClass"
import type settingsClass from "./settingsClass";
import type dataClass from "./dataClass";
import type controlLimitsClass from "./controlLimitsClass";

export type axisProperties = {
  lower: number,
  upper: number,
  start_padding: number,
  end_padding: number,
  colour: string,
  ticks: boolean,
  tick_size: string,
  tick_font: string,
  tick_colour: string,
  tick_rotation: number,
  tick_count: number,
  label: string,
  label_size: string,
  label_font: string,
  label_colour: string
};

export default class plotPropertiesClass {
  width: number;
  height: number;
  displayPlot: boolean;
  xAxis: axisProperties;
  yAxis: axisProperties;
  xScale: d3.ScaleLinear<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  firstRun: boolean;

  // Separate function so that the axis can be re-calculated on changes to padding
  initialiseScale(): void {
    this.xScale = d3.scaleLinear()
                    .domain([this.xAxis.lower, this.xAxis.upper])
                    .range([this.xAxis.start_padding,
                            this.width - this.xAxis.end_padding]);

    this.yScale = d3.scaleLinear()
                    .domain([this.yAxis.lower, this.yAxis.upper])
                    .range([this.height - this.yAxis.start_padding,
                            this.yAxis.end_padding]);
  }

  update(args: { options: VisualUpdateOptions,
                      plotPoints: plotData[],
                      controlLimits: controlLimitsClass,
                      inputData: dataClass,
                      inputSettings: settingsClass }): void {

    // Get the width and height of plotting space
    this.width = args.options.viewport.width;
    this.height = args.options.viewport.height;

    this.displayPlot = args.plotPoints
      ? args.plotPoints.length > 1
      : null;

    const xLowerLimit: number = args.inputSettings.x_axis.xlimit_l;
    let xUpperLimit: number = args.inputSettings.x_axis.xlimit_u;
    let yLowerLimit: number = args.inputSettings.y_axis.ylimit_l;
    let yUpperLimit: number = args.inputSettings.y_axis.ylimit_u;

    // Only update data-/settings-dependent plot aesthetics if they have changed
    if (args.inputData && args.controlLimits) {
      xUpperLimit = xUpperLimit !== null ? xUpperLimit : d3.max(args.controlLimits.keys.map(d => d.x))

      const limitMultiplier: number = args.inputSettings.y_axis.limit_multiplier;
      const chart_type: string = args.inputSettings.spc.chart_type;
      const values: number[] = args.controlLimits.values;
      const ul99: number[] = args.controlLimits.ul99;
      const ll99: number[] = args.controlLimits.ll99;
      const alt_targets: number[] = args.controlLimits.alt_targets;
      const maxValueOrLimit: number = d3.max(values.concat(ul99).concat(alt_targets));
      const minValueOrLimit: number = d3.min(values.concat(ll99).concat(alt_targets));
      const maxTarget: number = d3.max(args.controlLimits.targets);
      const minTarget: number = d3.min(args.controlLimits.targets);

      const upperLimitRaw: number = maxTarget + (maxValueOrLimit - maxTarget) * limitMultiplier;
      const lowerLimitRaw: number = minTarget - (minTarget - minValueOrLimit) * limitMultiplier;
      const multiplier: number = args.inputSettings.spc.multiplier;

      yUpperLimit = yUpperLimit !== null ? yUpperLimit :
        ["p", "pp"].includes(chart_type) && multiplier == 1
        ? truncate(upperLimitRaw, {upper: 1})
        : upperLimitRaw;
      yLowerLimit = yLowerLimit !== null ? yLowerLimit :
        (["p", "pp"].includes(chart_type) && multiplier == 1
        ? truncate(lowerLimitRaw, {lower: 0})
        : lowerLimitRaw);
    }

    const xTickSize: number = args.inputSettings.x_axis.xlimit_tick_size;
    const yTickSize: number = args.inputSettings.y_axis.ylimit_tick_size;

    const leftLabelPadding: number = args.inputSettings.y_axis.ylimit_label
                                      ? args.inputSettings.y_axis.ylimit_label_size
                                      : 0;

    const lowerLabelPadding: number = args.inputSettings.x_axis.xlimit_label
                                      ? args.inputSettings.x_axis.xlimit_label_size
                                      : 0;

    this.xAxis = {
      lower: xLowerLimit !== null ? xLowerLimit : 0,
      upper: xUpperLimit,
      start_padding: args.inputSettings.canvas.left_padding + leftLabelPadding,
      end_padding: args.inputSettings.canvas.right_padding,
      colour: args.inputSettings.x_axis.xlimit_colour,
      ticks: args.inputSettings.x_axis.xlimit_ticks,
      tick_size: `${xTickSize}px`,
      tick_font: args.inputSettings.x_axis.xlimit_tick_font,
      tick_colour: args.inputSettings.x_axis.xlimit_tick_colour,
      tick_rotation: args.inputSettings.x_axis.xlimit_tick_rotation,
      tick_count: args.inputSettings.x_axis.xlimit_tick_count,
      label: args.inputSettings.x_axis.xlimit_label,
      label_size: `${args.inputSettings.x_axis.xlimit_label_size}px`,
      label_font: args.inputSettings.x_axis.xlimit_label_font,
      label_colour: args.inputSettings.x_axis.xlimit_label_colour
    };

    this.yAxis = {
      lower: yLowerLimit,
      upper: yUpperLimit,
      start_padding: args.inputSettings.canvas.lower_padding + lowerLabelPadding,
      end_padding: args.inputSettings.canvas.upper_padding,
      colour: args.inputSettings.y_axis.ylimit_colour,
      ticks: args.inputSettings.y_axis.ylimit_ticks,
      tick_size: `${yTickSize}px`,
      tick_font: args.inputSettings.y_axis.ylimit_tick_font,
      tick_colour: args.inputSettings.y_axis.ylimit_tick_colour,
      tick_rotation: args.inputSettings.y_axis.ylimit_tick_rotation,
      tick_count: args.inputSettings.y_axis.ylimit_tick_count,
      label: args.inputSettings.y_axis.ylimit_label,
      label_size: `${args.inputSettings.y_axis.ylimit_label_size}px`,
      label_font: args.inputSettings.y_axis.ylimit_label_font,
      label_colour: args.inputSettings.y_axis.ylimit_label_colour
    };

    this.initialiseScale();
    this.firstRun = false;
  }
}
