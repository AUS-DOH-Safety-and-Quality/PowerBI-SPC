import * as d3 from "./D3 Modules";
import type { lineData } from "../Classes";
import { getAesthetic } from "../Functions";
import type { svgBaseType, Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  selection
      .select(".linesgroup")
      .selectAll(".linegroup")
      .data(visualObj.viewModel.groupedLines)
      .join("g")
      .classed("linegroup", true)
      .each(function(currLineData: [string, lineData[]]) {
        d3.select(this)
          .selectAll("line")
          .data(currLineData[1].slice(1) as lineData[])
          .join("line")
          .attr("x1", (_, idx) => visualObj.plotProperties.xScale(currLineData[1][idx].x))
          .attr("y1", (_, idx) => visualObj.plotProperties.yScale(currLineData[1][idx].line_value))
          .attr("x2", (d) => visualObj.plotProperties.xScale(d.x))
          .attr("y2", (d) => visualObj.plotProperties.yScale(d.line_value))
          .attr("fill", "none")
          .attr("stroke", visualObj.viewModel.colourPalette.isHighContrast
                    ? visualObj.viewModel.colourPalette.foregroundColour
                    : getAesthetic(currLineData[0], "lines", "colour", visualObj.viewModel.inputSettings.settings))
          .attr("stroke-width", getAesthetic(currLineData[0], "lines", "width", visualObj.viewModel.inputSettings.settings))
          .attr("stroke-dasharray", getAesthetic(currLineData[0], "lines", "type", visualObj.viewModel.inputSettings.settings))
          .attr("stroke-dashoffset", (_, idx) => {
              const prev_x = visualObj.plotProperties.xScale(currLineData[1][0].x);
              const curr_x = visualObj.plotProperties.xScale(currLineData[1][idx].x)
              const px_to_curr = curr_x - prev_x;
              return px_to_curr
          })
      })
}
