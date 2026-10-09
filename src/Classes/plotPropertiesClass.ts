import { min, max } from "powerbi-visuals-core/math";
import type { dataObject } from "../Functions/extractInputData";
import { isNullOrUndefined, isValidNumber } from "powerbi-visuals-core/data";
import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import type { settingsValueType } from "../settings";
import type { plotData, controlLimitsObject } from "./viewModelClass";
import type viewModelClass from "./viewModelClass";
import type derivedSettingsClass from "./derivedSettingsClass";
import type { ColourPalette } from "powerbi-visuals-core/powerbi";
import { scaleLinear, type LinearScale } from "powerbi-visuals-core/math";
import { axisPropertiesFromSettings, type AxisProperties } from "powerbi-visuals-core/rendering";

export default class plotPropertiesClass {
  width: number;
  height: number;
  displayPlot: boolean;
  xAxis: AxisProperties;
  yAxis: AxisProperties;
  xScale: LinearScale;
  yScale: LinearScale;

  // Separate function so that the axis can be re-calculated on changes to padding
  initialiseScale(svgWidth: number, svgHeight: number): void {
    this.width = svgWidth;
    this.height = svgHeight;
    this.xScale = scaleLinear()
                    .domain([this.xAxis.lower, this.xAxis.upper])
                    .range([this.xAxis.start_padding,
                            svgWidth - this.xAxis.end_padding]);

    this.yScale = scaleLinear()
                    .domain([this.yAxis.lower, this.yAxis.upper])
                    .range([svgHeight - this.yAxis.start_padding,
                            this.yAxis.end_padding]);
  }
  constructor() {
    const dummyAxisProperties: AxisProperties = {
      lower: 0,
      upper: 1,
      start_padding: 0,
      end_padding: 0,
      colour: "#000000",
      ticks: true,
      tick_marks: true,
      tick_size: "5px",
      tick_font: "sans-serif",
      tick_colour: "#000000",
      tick_rotation: 0,
      tick_count: 5,
      label: "",
      label_size: "12px",
      label_font: "sans-serif",
      label_colour: "#000000",
      label_style: "normal",
      label_align: "center",
      grid_show: false,
      grid_colour: "#D3D3D3",
      grid_width: 1
    }
    this.width = 0;
    this.height = 0;
    this.displayPlot = false;

    this.xAxis = dummyAxisProperties;
    this.yAxis = dummyAxisProperties;
    this.xScale = scaleLinear().domain([0, 1]).range([0, 1]);
    this.yScale = scaleLinear().domain([0, 1]).range([0, 1]);
  }

  update(options: VisualUpdateOptions, viewModel: viewModelClass): void {
    const plotPoints: plotData[] = viewModel.plotPoints[0] as plotData[] ?? [];
    const controlLimits: controlLimitsObject = viewModel.controlLimits[0];
    const inputData: dataObject = viewModel.inputData[0];
    const inputSettings: settingsValueType = viewModel.inputSettings.settings[0];
    const derivedSettings: derivedSettingsClass = viewModel.inputSettings.derivedSettings[0];
    const colorPalette: ColourPalette = viewModel.colourPalette;

    this.displayPlot = plotPoints.length > 0;

    let xLowerLimit: number | undefined = inputSettings.x_axis.xlimit_l;
    let xUpperLimit: number | undefined = inputSettings.x_axis.xlimit_u;
    let yLowerLimit: number | undefined = inputSettings.y_axis.ylimit_l;
    let yUpperLimit: number | undefined = inputSettings.y_axis.ylimit_u;

    // Only update data-/settings-dependent plot aesthetics if they have changed
    if (inputData?.validationStatus?.status == 0 && controlLimits) {
      xUpperLimit = !isNullOrUndefined(xUpperLimit) ? xUpperLimit : max(controlLimits.keys.map(d => d.x))

      const limitMultiplier: number = inputSettings.y_axis.limit_multiplier;
      const values: number[] = controlLimits.values.filter(d => isValidNumber(d));
      const ul99: number[] = controlLimits?.ul99?.filter(d => isValidNumber(d)) ?? [];
      const speclimits_upper: number[] = controlLimits?.speclimits_upper?.filter(d => isValidNumber(d)) ?? [];
      const ll99: number[] = controlLimits?.ll99?.filter(d => isValidNumber(d)) ?? [];
      const speclimits_lower: number[] = controlLimits?.speclimits_lower?.filter(d => isValidNumber(d)) ?? [];
      const alt_targets: number[] = controlLimits.alt_targets?.filter(d => isValidNumber(d)) ?? [];
      const targets: number[] = controlLimits.targets?.filter(d => isValidNumber(d)) ?? [];

      const maxValue: number = max(values);
      const maxValueOrLimit: number = max((values.concat(ul99).concat(speclimits_upper).concat(alt_targets)).filter(d => isValidNumber(d)));
      const minValueOrLimit: number = min((values.concat(ll99).concat(speclimits_lower).concat(alt_targets)).filter(d => isValidNumber(d)));
      let maxTarget: number = max(targets);
      if (!isValidNumber(maxTarget)) {
        maxTarget = (maxValueOrLimit - minValueOrLimit) / 2 + minValueOrLimit;
      }
      let minTarget: number = min(targets);
      if (!isValidNumber(minTarget)) {
        minTarget = (maxValueOrLimit - minValueOrLimit) / 2 + minValueOrLimit;
      }

      const upperLimitRaw: number = maxTarget + (maxValueOrLimit - maxTarget) * limitMultiplier;
      const lowerLimitRaw: number = minTarget - (minTarget - minValueOrLimit) * limitMultiplier;
      const multiplier: number = derivedSettings.multiplier;

      // Assume that observed values > 100% are intentional, and do not truncate
      yUpperLimit ??= (derivedSettings.percentLabels && !(maxValue > (1 * multiplier)))
                      ? Math.min(upperLimitRaw, 1 * multiplier)
                      : upperLimitRaw;

      yLowerLimit ??= derivedSettings.percentLabels
                      ? Math.max(lowerLimitRaw, 0)
                      : lowerLimitRaw;

      const keysToPlot: number[] = controlLimits.keys.map(d => d.x);

      xLowerLimit = !isNullOrUndefined(xLowerLimit)
        ? xLowerLimit
        : min(keysToPlot);

      xUpperLimit = !isNullOrUndefined(xUpperLimit)
        ? xUpperLimit
        : max(keysToPlot);
    }

    const leftLabelPadding: number = inputSettings.y_axis.ylimit_label
                                      ? inputSettings.y_axis.ylimit_label_size
                                      : 0;

    const lowerLabelPadding: number = inputSettings.x_axis.xlimit_label
                                      ? inputSettings.x_axis.xlimit_label_size
                                      : 0;

    this.xAxis = axisPropertiesFromSettings("x", inputSettings.x_axis, colorPalette, {
      lower: !isNullOrUndefined(xLowerLimit) ? xLowerLimit : 0,
      upper: xUpperLimit as number,
      start_padding: inputSettings.canvas.left_padding + leftLabelPadding,
      end_padding: inputSettings.canvas.right_padding
    });

    this.yAxis = axisPropertiesFromSettings("y", inputSettings.y_axis, colorPalette, {
      lower: yLowerLimit as number,
      upper: yUpperLimit as number,
      start_padding: inputSettings.canvas.lower_padding + lowerLabelPadding,
      end_padding: inputSettings.canvas.upper_padding
    });

    this.initialiseScale(options.viewport.width, options.viewport.height);
  }
}
