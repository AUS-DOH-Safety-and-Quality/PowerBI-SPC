import * as d3 from "./D3 Modules";
import type { defaultSettingsType, lineData } from "../Classes";
import { getAesthetic, isNullOrUndefined, between } from "../Functions";
import type { svgBaseType, Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  selection
      .select(".linesgroup")
      .selectAll(".linegroup")
      .data(visualObj.viewModel.groupedLines)
      .join("g")
      .classed("linegroup", true)
      .each(function(currLineData: [string, lineData[]]) {
        const currLine: string = currLineData[0];
        const validLineData: lineData[] = currLineData[1].filter((d: lineData) => {
          const ylower: number = visualObj.plotProperties.yAxis.lower;
          const yupper: number = visualObj.plotProperties.yAxis.upper;
          const xlower: number = visualObj.plotProperties.xAxis.lower;
          const xupper: number = visualObj.plotProperties.xAxis.upper;
          return !isNullOrUndefined(d.line_value)
                      && between(d.line_value, ylower, yupper)
                      && between(d.x, xlower, xupper)
        })
        d3.select(this)
          .selectAll("line")
          .data(validLineData.slice(1) as lineData[])
          .join("line")
          .attr("x1", (_, idx: number) => visualObj.plotProperties.xScale(validLineData[idx].x))
          .attr("y1", (_, idx: number) => visualObj.plotProperties.yScale(validLineData[idx].line_value))
          .attr("x2", (d: lineData) => visualObj.plotProperties.xScale(d.x))
          .attr("y2", (d: lineData) => visualObj.plotProperties.yScale(d.line_value))
          .attr("fill", "none")
          .attr("stroke", (d: lineData) => {
            return visualObj.viewModel.colourPalette.isHighContrast
                    ? visualObj.viewModel.colourPalette.foregroundColour
                    : getAesthetic(currLine, "lines", "colour", {lines: d.aesthetics} as defaultSettingsType)
          })
          .attr("stroke-width", (d: lineData) => getAesthetic(currLine, "lines", "width", {lines: d.aesthetics} as defaultSettingsType))
          .attr("stroke-dasharray", (d: lineData) => getAesthetic(currLine, "lines", "type", {lines: d.aesthetics} as defaultSettingsType))
          .attr("stroke-dashoffset", (_, idx: number) => {
              const prev_x: number = visualObj.plotProperties.xScale(validLineData[0].x);
              const curr_x: number = visualObj.plotProperties.xScale(validLineData[idx].x);
              return curr_x - prev_x
          })
      })
}
