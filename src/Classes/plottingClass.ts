import * as d3 from "d3";
import * as plottingFunctions from "../D3 Plotting Functions"
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import ISelectionId = powerbi.extensibility.ISelectionId;
import viewModelClass from "./viewModelClass";
import highlight from "../D3 Plotting Functions/highlight";

type funKey = keyof typeof plottingFunctions

class plottingClass {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  objects: string[] = ["xAxis", "yAxis", "tooltipLine", "lines", "dots", "icons"];

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
  }
}

export default plottingClass;
