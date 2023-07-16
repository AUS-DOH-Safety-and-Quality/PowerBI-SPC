import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import truncate from "../Functions/truncate";
import { plotData } from "./viewModelClass"
import settingsClass from "./settingsClass";
import dataClass from "./dataClass";
import controlLimits from "./controlLimits";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

type axisProperties = {
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

class plotPropertiesClass {
  width: number;
  height: number;
  displayPlot: boolean;
  xAxis: axisProperties;
  yAxis: axisProperties;
  xScale: d3.ScaleLinear<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  firstRun: boolean;

  // Separate function so that the axis can be re-calculated on changes to padding
  initialiseScale() {
    this.xScale = d3.scaleLinear()
                    .domain([this.xAxis.lower, this.xAxis.upper])
                    .range([this.xAxis.start_padding,
                            this.width - this.xAxis.end_padding]);

    this.yScale = d3.scaleLinear()
                            .domain([this.yAxis.lower, this.yAxis.upper])
                            .range([this.height - this.yAxis.end_padding,
                                    this.yAxis.start_padding]);
  }

  update(args: { options: VisualUpdateOptions,
                      plotPoints: plotData[],
                      calculatedLimits: controlLimits,
                      inputData: dataClass,
                      inputSettings: settingsClass }) {

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
    if (args.inputData && args.calculatedLimits) {
      xUpperLimit = xUpperLimit !== null ? xUpperLimit : d3.max(args.calculatedLimits.keys.map(d => d.x))

      const limitMultiplier: number = args.inputSettings.y_axis.limit_multiplier;
      const chart_type: string = args.inputSettings.spc.chart_type;
      const values: number[] = args.calculatedLimits.values;
      const ul99: number[] = args.calculatedLimits.ul99;
      const ll99: number[] = args.calculatedLimits.ll99;
      const maxValueOrLimit: number = d3.max(values.concat(ul99));
      const minValueOrLimit: number = d3.min(values.concat(ll99));
      const maxTarget: number = d3.max(args.calculatedLimits.targets);
      const minTarget: number = d3.min(args.calculatedLimits.targets);

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

    // Axis & label padding is based on the browser default font size of 16px,
    //    so need to scale accordingly if a different font size is used
    const browserFontSize: number = Number(window.getComputedStyle(document.body).getPropertyValue('font-size').match(/\d+/)[0]);
    const fontScaling: number = browserFontSize / 16;

    // Only scale padding for label if a label is actually present
    const xLabelSize: number = args.inputSettings.x_axis.xlimit_label_size;
    const xLabelPadding: number = args.inputSettings.x_axis.xlimit_label ? xLabelSize * fontScaling : 0;
    const yLabelSize: number = args.inputSettings.y_axis.ylimit_label_size;
    const yLabelPadding: number = args.inputSettings.y_axis.ylimit_label ? yLabelSize * fontScaling : 0;

    const xTickSize: number = args.inputSettings.x_axis.xlimit_tick_size;

    const yTickSize: number = args.inputSettings.y_axis.ylimit_tick_size;

    this.xAxis = {
      lower: xLowerLimit !== null ? xLowerLimit : 0,
      upper: xUpperLimit,
      start_padding: args.inputSettings.canvas.left_padding + xTickSize * fontScaling + xLabelPadding,
      end_padding: args.inputSettings.canvas.right_padding,
      colour: args.inputSettings.x_axis.xlimit_colour,
      ticks: args.inputSettings.x_axis.xlimit_ticks,
      tick_size: pixelConverter.toString(xTickSize),
      tick_font: args.inputSettings.x_axis.xlimit_tick_font,
      tick_colour: args.inputSettings.x_axis.xlimit_tick_colour,
      tick_rotation: args.inputSettings.x_axis.xlimit_tick_rotation,
      tick_count: args.inputSettings.x_axis.xlimit_tick_count,
      label: args.inputSettings.x_axis.xlimit_label,
      label_size: pixelConverter.toString(args.inputSettings.x_axis.xlimit_label_size),
      label_font: args.inputSettings.x_axis.xlimit_label_font,
      label_colour: args.inputSettings.x_axis.xlimit_label_colour
    };

    this.yAxis = {
      lower: yLowerLimit,
      upper: yUpperLimit,
      start_padding: args.inputSettings.canvas.upper_padding,
      end_padding: args.inputSettings.canvas.lower_padding + yTickSize * fontScaling + yLabelPadding,
      colour: args.inputSettings.y_axis.ylimit_colour,
      ticks: args.inputSettings.y_axis.ylimit_ticks,
      tick_size: pixelConverter.toString(yTickSize),
      tick_font: args.inputSettings.y_axis.ylimit_tick_font,
      tick_colour: args.inputSettings.y_axis.ylimit_tick_colour,
      tick_rotation: args.inputSettings.y_axis.ylimit_tick_rotation,
      tick_count: args.inputSettings.y_axis.ylimit_tick_count,
      label: args.inputSettings.y_axis.ylimit_label,
      label_size: pixelConverter.toString(args.inputSettings.y_axis.ylimit_label_size),
      label_font: args.inputSettings.y_axis.ylimit_label_font,
      label_colour: args.inputSettings.y_axis.ylimit_label_colour
    };
  this.initialiseScale();
  this.firstRun = false;
  }
}

export default plotPropertiesClass
export { axisProperties }
