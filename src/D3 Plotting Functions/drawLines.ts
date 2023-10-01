import * as d3 from "./D3 Modules";
import type { lineData } from "../Classes";
import { between, getAesthetic } from "../Functions";
import type { svgBaseType, Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  selection
      .select(".linesgroup")
      .selectAll("path")
      .data(visualObj.viewModel.groupedLines)
      .join("path")
      .attr("d", d => {
        const ylower: number = visualObj.viewModel.plotProperties.yAxis.lower;
        const yupper: number = visualObj.viewModel.plotProperties.yAxis.upper;
        const xlower: number = visualObj.viewModel.plotProperties.xAxis.lower;
        const xupper: number = visualObj.viewModel.plotProperties.xAxis.upper;
        return d3.line<lineData>()
                  .x(d => visualObj.viewModel.plotProperties.xScale(d.x))
                  .y(d => visualObj.viewModel.plotProperties.yScale(d.line_value))
                  .defined(d => {
                    return d.line_value !== null
                      && between(d.line_value, ylower, yupper)
                      && between(d.x, xlower, xupper)
                  })(d[1])
      })
      .attr("fill", "none")
      .attr("stroke", d => getAesthetic(d[0], "lines", "colour", visualObj.viewModel.inputSettings.settings))
      .attr("stroke-width", d => getAesthetic(d[0], "lines", "width", visualObj.viewModel.inputSettings.settings))
      .attr("stroke-dasharray", d => getAesthetic(d[0], "lines", "type", visualObj.viewModel.inputSettings.settings));
}
