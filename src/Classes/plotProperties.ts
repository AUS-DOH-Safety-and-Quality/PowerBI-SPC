import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import axisLimits from "./axisLimits"
import viewModelObject from "./viewModel";
import settingsObject from "./settingsObject";

class plotPropertiesClass {
  width: number;
  height: number;
  displayPlot: boolean;
  axisLimits: axisLimits;
  xScale: d3.ScaleLinear<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;

  constructor(args: { options: VisualUpdateOptions,
                      viewModel: viewModelObject;
                      inputSettings: settingsObject }) {

    // Get the width and height of plotting space
    this.width = args.options.viewport.width;
    this.height = args.options.viewport.height;

    this.displayPlot = args.viewModel.plotPoints
      ? args.viewModel.plotPoints.length > 1
      : null;

    let yAxisMin: number = args.viewModel.axisLimits
      ? args.viewModel.axisLimits.y.lower
      : null;
    let yAxisMax: number = args.viewModel.axisLimits
      ? args.viewModel.axisLimits.y.upper
      : null;
    let xAxisMin: number = args.viewModel.axisLimits
      ? args.viewModel.axisLimits.x.lower
      : null;
    let xAxisMax: number = args.viewModel.axisLimits
      ? args.viewModel.axisLimits.x.upper
      : null;

    let xAxisPadding: number = args.inputSettings.axispad.x.padding.value;
    let yAxisPadding: number = args.inputSettings.axispad.y.padding.value;

    this.axisLimits = {
      x: {
        lower: xAxisMin,
        upper: xAxisMax,
        padding: xAxisPadding
      },
      y: {
        lower: yAxisMin,
        upper: yAxisMax,
        padding: yAxisPadding
      }
    }

    this.xScale = d3.scaleLinear()
                    .domain([xAxisMin, xAxisMax])
                    .range([yAxisPadding,
                            this.width - args.inputSettings.axispad.y.end_padding.value]);

    this.yScale = d3.scaleLinear()
                            .domain([yAxisMin, yAxisMax])
                            .range([this.height - args.inputSettings.axispad.x.padding.value,
                                    args.inputSettings.axispad.x.end_padding.value]);
  }
}

export default plotPropertiesClass
