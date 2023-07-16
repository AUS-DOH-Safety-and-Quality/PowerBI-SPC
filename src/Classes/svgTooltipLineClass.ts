import * as d3 from "d3";
import viewModelClass from "./viewModelClass";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgTooltipLineClass {
  tooltipLineGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.tooltipLineGroup.selectAll(".obs-sel").remove()
    if (!(viewModel.plotProperties.displayPlot)) {
      return;
    }

    this.tooltipLineGroup
        .append('g')
        .classed("obs-sel", true)
        .selectAll(".obs-sel")
        .data(viewModel.plotPoints)
        .enter()
        .append("rect")
        .style("fill","transparent")
        .attr("width", viewModel.plotProperties.width)
        .attr("height", viewModel.plotProperties.height)
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.tooltipLineGroup = svg.append("g");
  }
}
export default svgTooltipLineClass
