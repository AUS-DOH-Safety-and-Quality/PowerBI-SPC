import * as d3 from "d3";
import viewModelClass from "../Classes/viewModelClass";

type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

export default function drawTooltipLine(selection: SelectionBase, viewModel: viewModelClass) {
  selection.selectAll(".ttip-line").remove()
  if (!(viewModel.plotProperties.displayPlot)) {
    return;
  }

  selection
      .append('g')
      .classed("ttip-line", true)
      .selectAll(".ttip-line")
      .data(viewModel.plotPoints)
      .enter()
      .append("rect")
      .attr("stroke-width", "1px")
      .attr("width", ".5px")
      .attr("height", viewModel.plotProperties.height)
      .style("fill-opacity", 0)
}
