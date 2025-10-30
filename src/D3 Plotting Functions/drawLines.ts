import * as d3 from "./D3 Modules";
import type { lineData } from "../Classes";
import { between, getAesthetic, isNullOrUndefined } from "../Functions";
import type { svgBaseType, Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  selection
      .select(".linesgroup")
      .selectAll("path")
      .data(visualObj.viewModel.groupedLines)
      .join("path")
      .attr("d", d => {
        const ylower: number = visualObj.plotProperties.yAxis.lower;
        const yupper: number = visualObj.plotProperties.yAxis.upper;
        const xlower: number = visualObj.plotProperties.xAxis.lower;
        const xupper: number = visualObj.plotProperties.xAxis.upper;
        return d3.line<lineData>()
                  .x(d => visualObj.plotProperties.xScale(d.x))
                  .y(d => visualObj.plotProperties.yScale(d.line_value))
                  .defined(d => {
                    return !isNullOrUndefined(d.line_value)
                      && between(d.line_value, ylower, yupper)
                      && between(d.x, xlower, xupper)
                  })(d[1])
      })
      .attr("fill", "none")
      .attr("stroke", d => {
        return visualObj.viewModel.colourPalette.isHighContrast
                ? visualObj.viewModel.colourPalette.foregroundColour
                : getAesthetic(d[0], "lines", "colour", visualObj.viewModel.inputSettings.settings)
      })
      .attr("stroke-width", d => getAesthetic(d[0], "lines", "width", visualObj.viewModel.inputSettings.settings))
      .attr("stroke-dasharray", d => getAesthetic(d[0], "lines", "type", visualObj.viewModel.inputSettings.settings));
}
