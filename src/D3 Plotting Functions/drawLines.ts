import * as d3 from "./D3 Modules";
import type { defaultSettingsType, lineData } from "../Classes";
import { getAesthetic, isNullOrUndefined, between } from "../Functions";
import type { svgBaseType, Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  const ylower: number = visualObj.plotProperties.yAxis.lower;
  const yupper: number = visualObj.plotProperties.yAxis.upper;
  const xlower: number = visualObj.plotProperties.xAxis.lower;
  const xupper: number = visualObj.plotProperties.xAxis.upper;

  selection
      .select(".linesgroup")
      .selectAll(".linegroup")
      .data(visualObj.viewModel.groupedLines)
      .join("g")
      .classed("linegroup", true)
      .each(function(currLineDataFull: [string, lineData[]]) {
        const currLine: string = currLineDataFull[0];
        const currLineData: lineData[] = currLineDataFull[1].filter((d: lineData) => between(d.x, xlower, xupper));
        const n: number = currLineData.length;
        let yValidStatus: boolean[] = new Array<boolean>(n);
        let anyValid: boolean = false;
        let xValues: number[] = new Array<number>(n);
        let yValues: number[] = new Array<number>(n);

        for (let i = 0; i < n; i++) {
          const currPoint: lineData = currLineData[i];

          xValues[i] = visualObj.plotProperties.xScale(currPoint.x);
          yValues[i] = visualObj.plotProperties.yScale(currPoint.line_value);
          yValidStatus[i] = !isNullOrUndefined(currPoint.line_value) && between(currPoint.line_value, ylower, yupper);
          anyValid = anyValid || yValidStatus[i];
        }

        if (!anyValid) {
          d3.select(this).selectAll("line").remove();
          return;
        }

        d3.select(this)
          .selectAll("line")
          .data(currLineData.slice(1) as lineData[])
          .join("line")
          .attr("x1", (_, idx: number) => yValidStatus[idx] ? xValues[idx] : xValues[idx + 1])
          .attr("y1", (_, idx: number) => yValidStatus[idx] ? yValues[idx] : yValues[idx + 1])
          .attr("x2", (_, idx: number) => yValidStatus[idx + 1] ? xValues[idx + 1] : xValues[idx])
          .attr("y2", (_, idx: number) => yValidStatus[idx + 1] ? yValues[idx + 1] : yValues[idx])
          .attr("fill", "none")
          .attr("stroke", (d: lineData) => {
            return visualObj.viewModel.colourPalette.isHighContrast
                    ? visualObj.viewModel.colourPalette.foregroundColour
                    : getAesthetic(currLine, "lines", "colour", { lines: d.aesthetics } as defaultSettingsType)
          })
          .attr("stroke-width", (d: lineData) => getAesthetic(currLine, "lines", "width", { lines: d.aesthetics } as defaultSettingsType))
          .attr("stroke-dasharray", (d: lineData) => getAesthetic(currLine, "lines", "type", { lines: d.aesthetics } as defaultSettingsType))
          .attr("stroke-dashoffset", (_, idx: number) => {
              const prev_x: number = visualObj.plotProperties.xScale(currLineData[0].x);
              const curr_x: number = visualObj.plotProperties.xScale(currLineData[idx].x);
              return curr_x - prev_x
          })
      })
}
