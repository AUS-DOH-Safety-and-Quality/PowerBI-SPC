import * as d3 from "./D3 Modules";
import { type lineData } from "../Classes/viewModelClass";
import between from "../Functions/between";
import getAesthetic from "../Functions/getAesthetic";
import { type svgBaseType, type Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  selection
      .select(".linesgroup")
      .selectAll("path")
      .data(visualObj.viewModel.groupedLines)
      .join("path")
      .attr("d", d => {
        const lower: number = visualObj.viewModel.plotProperties.yAxis.lower;
        const upper: number = visualObj.viewModel.plotProperties.yAxis.upper;
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
