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
      .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", viewModel.plotProperties.yAxis.end_padding)
      .attr("y2", viewModel.plotProperties.height - viewModel.plotProperties.yAxis.start_padding)
      .attr("stroke-width", "1px")
      .attr("stroke", "black")
      .style("stroke-opacity", 0)
}
