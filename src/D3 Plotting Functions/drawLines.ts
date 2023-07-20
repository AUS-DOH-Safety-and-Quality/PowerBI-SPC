import * as d3 from "d3";
import { lineData } from "../Classes/viewModelClass";
import between from "../Functions/between";
import getAesthetic from "../Functions/getAesthetic";
import { svgBaseType, Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  selection.selectAll(".linesgroup").remove()
  if (!(visualObj.viewModel.groupedLines)) {
    return;
  }
  const lower: number = visualObj.viewModel.plotProperties.yAxis.lower;
  const upper: number = visualObj.viewModel.plotProperties.yAxis.upper;

  selection
      .append('g')
      .classed("linesgroup", true)
      .selectAll(".linesgroup")
      .data(visualObj.viewModel.groupedLines)
      .enter()
      .append("path")
      .attr("d", d => {
        return d3.line<lineData>()
                  .x(d => visualObj.viewModel.plotProperties.xScale(d.x))
                  .y(d => visualObj.viewModel.plotProperties.yScale(d.line_value))
                  .defined(d => d.line_value !== null && between(d.line_value, lower, upper))(d[1])
      })
      .attr("fill", "none")
      .attr("stroke", d => getAesthetic(d[0], "lines", "colour", visualObj.viewModel.inputSettings))
      .attr("stroke-width", d => getAesthetic(d[0], "lines", "width", visualObj.viewModel.inputSettings))
      .attr("stroke-dasharray", d => getAesthetic(d[0], "lines", "type", visualObj.viewModel.inputSettings));
}
