import * as d3 from "../D3 Plotting Functions/D3 Modules";
import truncate from "../Functions/truncate";
import min from "../Functions/min";
import max from "../Functions/max";
import type { dataObject } from "../Functions/extractInputData";
import isNullOrUndefined from "../Functions/isNullOrUndefined";
import isValidNumber from "../Functions/isValidNumber";
import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import type { defaultSettingsType } from "./settingsClass";
import type { plotData, controlLimitsObject } from "./viewModelClass";
import type viewModelClass from "./viewModelClass";
import type derivedSettingsClass from "./derivedSettingsClass";
import type { colourPaletteType } from "./viewModelClass";

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
  displayPlot: boolean;
  xAxis: axisProperties;
  yAxis: axisProperties;
  xScale: d3.ScaleLinear<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;

  // Separate function so that the axis can be re-calculated on changes to padding
  initialiseScale(svgWidth: number, svgHeight: number): void {
    this.xScale = d3.scaleLinear()
                    .domain([this.xAxis.lower, this.xAxis.upper])
                    .range([this.xAxis.start_padding,
                            svgWidth - this.xAxis.end_padding]);

    this.yScale = d3.scaleLinear()
                    .domain([this.yAxis.lower, this.yAxis.upper])
                    .range([svgHeight - this.yAxis.start_padding,
                            this.yAxis.end_padding]);
  }

  update(options: VisualUpdateOptions, viewModel: viewModelClass): void {
    const plotPoints: plotData[] = viewModel.plotPoints[0] as plotData[] ?? [];
    const controlLimits: controlLimitsObject = viewModel.controlLimits[0];
    const inputData: dataObject = viewModel.inputData[0];
    const inputSettings: defaultSettingsType = viewModel.inputSettings.settings[0];
    const derivedSettings: derivedSettingsClass = viewModel.inputSettings.derivedSettings[0];
    const colorPalette: colourPaletteType = viewModel.colourPalette;

    this.displayPlot = plotPoints
      ? plotPoints.length > 1
      : null;

    let xLowerLimit: number = inputSettings.x_axis.xlimit_l;
    let xUpperLimit: number = inputSettings.x_axis.xlimit_u;
    let yLowerLimit: number = inputSettings.y_axis.ylimit_l;
    let yUpperLimit: number = inputSettings.y_axis.ylimit_u;

    // Only update data-/settings-dependent plot aesthetics if they have changed
    if (inputData?.validationStatus?.status == 0 && controlLimits) {
      xUpperLimit = !isNullOrUndefined(xUpperLimit) ? xUpperLimit : max(controlLimits.keys.map(d => d.x))

      const limitMultiplier: number = inputSettings.y_axis.limit_multiplier;
      const values: number[] = controlLimits.values.filter(d => isValidNumber(d));
      const ul99: number[] = controlLimits?.ul99?.filter(d => isValidNumber(d));
      const speclimits_upper: number[] = controlLimits?.speclimits_upper?.filter(d => isValidNumber(d));
      const ll99: number[] = controlLimits?.ll99?.filter(d => isValidNumber(d));
      const speclimits_lower: number[] = controlLimits?.speclimits_lower?.filter(d => isValidNumber(d));
      const alt_targets: number[] = controlLimits.alt_targets?.filter(d => isValidNumber(d));
      const targets: number[] = controlLimits.targets?.filter(d => isValidNumber(d));

      const maxValue: number = max(values);
      const maxValueOrLimit: number = max(values.concat(ul99).concat(speclimits_upper).concat(alt_targets));
      const minValueOrLimit: number = min(values.concat(ll99).concat(speclimits_lower).concat(alt_targets));
      const maxTarget: number = max(targets) ?? 0;
      const minTarget: number = min(targets) ?? 0;

      const upperLimitRaw: number = maxTarget + (maxValueOrLimit - maxTarget) * limitMultiplier;
      const lowerLimitRaw: number = minTarget - (minTarget - minValueOrLimit) * limitMultiplier;
      const multiplier: number = derivedSettings.multiplier;

      // Assume that observed values > 100% are intentional, and do not truncate
      yUpperLimit ??= (derivedSettings.percentLabels && !(maxValue > (1 * multiplier)))
                      ? truncate(upperLimitRaw, {upper: 1 * multiplier})
                      : upperLimitRaw;

      yLowerLimit ??= derivedSettings.percentLabels
                      ? truncate(lowerLimitRaw, {lower: 0 * multiplier})
                      : lowerLimitRaw;

      const keysToPlot: number[] = controlLimits.keys.map(d => d.x);

      xLowerLimit = !isNullOrUndefined(xLowerLimit)
        ? xLowerLimit
        : min(keysToPlot);

      xUpperLimit = !isNullOrUndefined(xUpperLimit)
        ? xUpperLimit
        : max(keysToPlot);
    }

    const xTickSize: number = inputSettings.x_axis.xlimit_tick_size;
    const yTickSize: number = inputSettings.y_axis.ylimit_tick_size;

    const leftLabelPadding: number = inputSettings.y_axis.ylimit_label
                                      ? inputSettings.y_axis.ylimit_label_size
                                      : 0;

    const lowerLabelPadding: number = inputSettings.x_axis.xlimit_label
                                      ? inputSettings.x_axis.xlimit_label_size
                                      : 0;

    this.xAxis = {
      lower: !isNullOrUndefined(xLowerLimit) ? xLowerLimit : 0,
      upper: xUpperLimit,
      start_padding: inputSettings.canvas.left_padding + leftLabelPadding,
      end_padding: inputSettings.canvas.right_padding,
      colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.x_axis.xlimit_colour,
      ticks: inputSettings.x_axis.xlimit_ticks,
      tick_size: `${xTickSize}px`,
      tick_font: inputSettings.x_axis.xlimit_tick_font,
      tick_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.x_axis.xlimit_tick_colour,
      tick_rotation: inputSettings.x_axis.xlimit_tick_rotation,
      tick_count: inputSettings.x_axis.xlimit_tick_count,
      label: inputSettings.x_axis.xlimit_label,
      label_size: `${inputSettings.x_axis.xlimit_label_size}px`,
      label_font: inputSettings.x_axis.xlimit_label_font,
      label_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.x_axis.xlimit_label_colour
    };

    this.yAxis = {
      lower: yLowerLimit,
      upper: yUpperLimit,
      start_padding: inputSettings.canvas.lower_padding + lowerLabelPadding,
      end_padding: inputSettings.canvas.upper_padding,
      colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.y_axis.ylimit_colour,
      ticks: inputSettings.y_axis.ylimit_ticks,
      tick_size: `${yTickSize}px`,
      tick_font: inputSettings.y_axis.ylimit_tick_font,
      tick_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.y_axis.ylimit_tick_colour,
      tick_rotation: inputSettings.y_axis.ylimit_tick_rotation,
      tick_count: inputSettings.y_axis.ylimit_tick_count,
      label: inputSettings.y_axis.ylimit_label,
      label_size: `${inputSettings.y_axis.ylimit_label_size}px`,
      label_font: inputSettings.y_axis.ylimit_label_font,
      label_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.y_axis.ylimit_label_colour
    };

    this.initialiseScale(options.viewport.width, options.viewport.height);
  }
}
