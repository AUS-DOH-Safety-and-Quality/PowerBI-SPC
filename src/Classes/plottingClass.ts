import * as d3 from "d3";
import * as plottingFunctions from "../D3 Plotting Functions"
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import ISelectionId = powerbi.extensibility.ISelectionId;
import svgDotsClass from "./svgDotsClass";
import svgIconClass from "./svgIconClass";
import svgLinesClass from "./svgLinesClass";
import svgTooltipLineClass from "./svgTooltipLineClass";
import svgXAxisClass from "./svgXAxisClass";
import svgYAxisClass from "./svgYAxisClass";
import viewModelClass from "./viewModelClass";
import highlight from "../D3 Plotting Functions/highlight";

type funKey = keyof typeof plottingFunctions

class plottingClass {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  objects: string[] = ["xAxis", "yAxis", "lines", "dots", "icons", "tooltipLine"];

  draw(viewModel: viewModelClass): void {
    this.svg.attr("width", viewModel.plotProperties.width)
            .attr("height", viewModel.plotProperties.height);
    this.objects.forEach(plotObject => {
      this.svg.call(plottingFunctions[plotObject as funKey], viewModel)
    })
  }
  updateHighlighting(viewModel: viewModelClass, allSelectionIDs: ISelectionId[]) {
    this.svg.call(highlight, viewModel, allSelectionIDs)
  }

  constructor(options: VisualConstructorOptions) {
    this.svg = d3.select(options.element).append("svg");
    this.objects.forEach(plotObject => {
      this.svg.append("g").classed(`.${plotObject}`, true)
    })
  }
}

export default plottingClass;
