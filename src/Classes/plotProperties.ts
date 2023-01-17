import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import truncate from "../Functions/truncate";
import plotData from "./plotData"
import settingsObject from "./settingsObject";
import dataObject from "./dataObject";
import controlLimits from "./controlLimits";

type axisProperties = {
  lower: number,
  upper: number,
  padding: number,
  end_padding: number,
  ticks: boolean,
  tick_size: string,
  tick_font: string,
  label: string,
  label_size: string,
  label_font: string
};

class plotPropertiesClass {
  width: number;
  height: number;
  displayPlot: boolean;
  xAxis: axisProperties;
  yAxis: axisProperties;
  xScale: d3.ScaleLinear<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;

  constructor(args: { options: VisualUpdateOptions,
                      plotPoints: plotData[],
                      calculatedLimits: controlLimits,
                      inputData: dataObject,
                      inputSettings: settingsObject }) {

    // Get the width and height of plotting space
    this.width = args.options.viewport.width;
    this.height = args.options.viewport.height;

    this.displayPlot = args.plotPoints
      ? args.plotPoints.length > 1
      : null;

      let limitMultiplier: number = args.inputSettings.y_axis.limit_multiplier.value;
      let chart_type: string = args.inputData.chart_type;
      let values: number[] = args.calculatedLimits.values;
      let ul99: number[] = args.calculatedLimits.ul99;
      let ll99: number[] = args.calculatedLimits.ll99;
      let maxValueOrLimit: number = d3.max(values.concat(ul99));
      let minValueOrLimit: number = d3.min(values.concat(ll99));
      let maxTarget: number = d3.max(args.calculatedLimits.targets);
      let minTarget: number = d3.min(args.calculatedLimits.targets);

      let xLowerInput: number = args.inputSettings.x_axis.xlimit_l.value;
      let xUpperInput: number = args.inputSettings.x_axis.xlimit_u.value;
      let yLowerInput: number = args.inputSettings.y_axis.ylimit_l.value;
      let yUpperInput: number = args.inputSettings.y_axis.ylimit_u.value;
      let multiplier: number = args.inputData.multiplier;

      let upperLimitRaw: number = maxTarget + (maxValueOrLimit - maxTarget) * limitMultiplier;
      let lowerLimitRaw: number = minTarget - (minTarget - minValueOrLimit) * limitMultiplier;

      let upperLimit: number
        = ["p", "pp"].includes(chart_type) && multiplier == 1
        ? truncate(upperLimitRaw, {upper: 1})
        : upperLimitRaw;
      let lowerLimit: number
        = ["p", "pp"].includes(chart_type) && multiplier == 1
        ? truncate(lowerLimitRaw, {lower: 0})
        : lowerLimitRaw;


      // Axis & label padding is based on the browser default font size of 16px,
      //    so need to scale accordingly if a different font size is used
      let browserFontSize: number = Number(window.getComputedStyle(document.body).getPropertyValue('font-size').match(/\d+/)[0]);
      let fontScaling: number = browserFontSize / 16;

      // Map the default pixel sizes for each text label, based on browser default, and scale
      // https://careerkarma.com/blog/css-font-size/
      let fontSizeMap = {
        "xx-small" : 9 * fontScaling,
        "x-small" : 10 * fontScaling,
        "small" : 13 * fontScaling,
        "medium" : 16 * fontScaling,
        "large" : 18 * fontScaling,
        "x-large" : 24 * fontScaling,
        "xx-large" : 32 * fontScaling
      };

      // Only scale padding for label if a label is actually present
      let xLabelSize: string = args.inputSettings.x_axis.xlimit_label_size.value;
      let xLabelPadding: number = args.inputSettings.x_axis.xlimit_label.value ? fontSizeMap[xLabelSize] : 0;
      let yLabelSize: string = args.inputSettings.y_axis.ylimit_label_size.value;
      let yLabelPadding: number = args.inputSettings.y_axis.ylimit_label.value ? fontSizeMap[yLabelSize] : 0;

      let xPadding: number = args.inputSettings.axispad.x.padding.value;
      let xTickSize: string = args.inputSettings.x_axis.xlimit_tick_size.value;

      let yPadding: number = args.inputSettings.axispad.y.padding.value;
      let yTickSize: string = args.inputSettings.y_axis.ylimit_tick_size.value;


      this.xAxis = {
        lower: xLowerInput ? xLowerInput : 0,
        upper: xUpperInput ? xUpperInput : d3.max(args.calculatedLimits.keys.map(d => d.x)),
        padding: xPadding + fontSizeMap[xTickSize] + xLabelPadding,
        end_padding: args.inputSettings.axispad.x.end_padding.value,
        ticks: args.inputSettings.x_axis.xlimit_ticks.value,
        tick_size: xTickSize,
        tick_font: args.inputSettings.x_axis.xlimit_tick_font.value,
        label: args.inputSettings.x_axis.xlimit_label.value,
        label_size: args.inputSettings.x_axis.xlimit_label_size.value,
        label_font: args.inputSettings.x_axis.xlimit_label_font.value
      };

      this.yAxis = {
        lower: yLowerInput ? yLowerInput : lowerLimit,
        upper: yUpperInput ? yUpperInput : upperLimit,
        padding: yPadding + fontSizeMap[yTickSize] + yLabelPadding,
        end_padding: args.inputSettings.axispad.y.end_padding.value,
        ticks: args.inputSettings.y_axis.ylimit_ticks.value,
        tick_size: yTickSize,
        tick_font: args.inputSettings.y_axis.ylimit_tick_font.value,
        label: args.inputSettings.y_axis.ylimit_label.value,
        label_size: args.inputSettings.y_axis.ylimit_label_size.value,
        label_font: args.inputSettings.y_axis.ylimit_label_font.value
      };

    this.xScale = d3.scaleLinear()
                    .domain([this.xAxis.lower, this.xAxis.upper])
                    .range([this.yAxis.padding,
                            this.width - this.yAxis.end_padding]);

    this.yScale = d3.scaleLinear()
                            .domain([this.yAxis.lower, this.yAxis.upper])
                            .range([this.height - this.xAxis.padding,
                                    this.xAxis.end_padding]);
  }
}

export default plotPropertiesClass
export { axisProperties }
