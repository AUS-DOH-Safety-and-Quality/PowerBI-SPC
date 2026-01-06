import * as d3 from "./D3 Modules";
import type { defaultSettingsType, lineData } from "../Classes";
import { getAesthetic, isNullOrUndefined/*, between*/ } from "../Functions";
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
        const n: number = currLineData[1].length;
        let validStatus: boolean[] = new Array<boolean>(n);
        let xValues: number[] = new Array<number>(n);
        let yValues: number[] = new Array<number>(n);

        for (let i = 0; i < n; i++) {
          const currPoint: lineData = currLineData[1][i];
          xValues[i] = visualObj.plotProperties.xScale(currPoint.x);
          yValues[i] = visualObj.plotProperties.yScale(currPoint.line_value);
          validStatus[i] = !isNullOrUndefined(currPoint.line_value);
        }

        d3.select(this)
          .selectAll("line")
          .data(currLineData[1].slice(1) as lineData[])
          .join("line")
          .attr("x1", (_, idx: number) => validStatus[idx] ? xValues[idx] : xValues[idx + 1])
          .attr("y1", (_, idx: number) => validStatus[idx] ? yValues[idx] : yValues[idx + 1])
          .attr("x2", (_, idx: number) => validStatus[idx + 1] ? xValues[idx + 1] : xValues[idx])
          .attr("y2", (_, idx: number) => validStatus[idx + 1] ? yValues[idx + 1] : yValues[idx])
          .attr("fill", "none")
          .attr("stroke", (d: lineData) => {
            return visualObj.viewModel.colourPalette.isHighContrast
                    ? visualObj.viewModel.colourPalette.foregroundColour
                    : getAesthetic(currLine, "lines", "colour", { lines: d.aesthetics } as defaultSettingsType)
          })
          .attr("stroke-width", (d: lineData) => getAesthetic(currLine, "lines", "width", { lines: d.aesthetics } as defaultSettingsType))
          .attr("stroke-dasharray", (d: lineData) => getAesthetic(currLine, "lines", "type", { lines: d.aesthetics } as defaultSettingsType))
          .attr("stroke-dashoffset", (_, idx: number) => {
              const prev_x: number = visualObj.plotProperties.xScale(currLineData[1][0].x);
              const curr_x: number = visualObj.plotProperties.xScale(currLineData[1][idx].x);
              return curr_x - prev_x
          })
      })
}
