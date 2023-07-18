import * as d3 from "d3";
import viewModelClass from "../Classes/viewModelClass";
import { lineData } from "../Classes/viewModelClass";
import between from "../Functions/between";
import getAesthetic from "../Functions/getAesthetic";

type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

export default function drawLines(selection: SelectionBase, viewModel: viewModelClass) {
  selection.selectAll(".linesgroup").remove()
  if (!(viewModel.groupedLines)) {
    return;
  }
  const lower: number = viewModel.plotProperties.yAxis.lower;
  const upper: number = viewModel.plotProperties.yAxis.upper;

  selection
      .append('g')
      .classed("linesgroup", true)
      .selectAll(".linesgroup")
      .data(viewModel.groupedLines)
      .enter()
      .append("path")
      .attr("d", d => {
        return d3.line<lineData>()
                  .x(d => viewModel.plotProperties.xScale(d.x))
                  .y(d => viewModel.plotProperties.yScale(d.line_value))
                  .defined(d => d.line_value !== null && between(d.line_value, lower, upper))(d[1])
      })
      .attr("fill", "none")
      .attr("stroke", d => getAesthetic(d[0], "lines", "colour", viewModel.inputSettings))
      .attr("stroke-width", d => getAesthetic(d[0], "lines", "width", viewModel.inputSettings))
      .attr("stroke-dasharray", d => getAesthetic(d[0], "lines", "type", viewModel.inputSettings));
}
