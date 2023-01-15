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

    let currentLimits: axisLimits = args.viewModel.axisLimits;

    this.xScale = d3.scaleLinear()
                    .domain([currentLimits.x.lower, currentLimits.x.upper])
                    .range([currentLimits.y.padding,
                            this.width - currentLimits.y.end_padding]);

    this.yScale = d3.scaleLinear()
                            .domain([currentLimits.y.lower, currentLimits.y.upper])
                            .range([this.height - currentLimits.x.padding,
                                    currentLimits.x.end_padding]);
  }
}

export default plotPropertiesClass
