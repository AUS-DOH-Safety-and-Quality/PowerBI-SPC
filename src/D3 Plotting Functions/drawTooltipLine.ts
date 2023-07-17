import * as d3 from "d3";
import viewModelClass from "../Classes/viewModelClass";
import { plotData } from "../Classes/viewModelClass";
import between from "../Functions/between";

type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

export default function drawTooltipLine(selection: SelectionBase, viewModel: viewModelClass) {
  selection.selectAll(".obs-sel").remove()
  selection.selectAll(".ttip-line").remove()
  if (!(viewModel.plotProperties.displayPlot)) {
    return;
  }

  selection
      .append('g')
      .classed("obs-sel", true)
      .selectAll(".obs-sel")
      .data(viewModel.plotPoints)
      .enter()
      .append("rect")
      .style("fill","transparent")
      .attr("width", viewModel.plotProperties.width)
      .attr("height", viewModel.plotProperties.height)

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
