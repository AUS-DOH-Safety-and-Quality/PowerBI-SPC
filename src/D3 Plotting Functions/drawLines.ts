import * as d3 from "./D3 Modules";
import type { settingsValueType } from "../settings";
import type { lineData } from "../Classes/viewModelClass";
import getAesthetic from "../Functions/getAesthetic";
import isNullOrUndefined from "../Functions/isNullOrUndefined";
import between from "../Functions/between";
import type { svgBaseType, Visual } from "../visual";

export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  const ylower: number = visualObj.plotProperties.yAxis.lower;
  const yupper: number = visualObj.plotProperties.yAxis.upper;
  const xlower: number = visualObj.plotProperties.xAxis.lower;
  const xupper: number = visualObj.plotProperties.xAxis.upper;

  selection
      .select(".linesgroup")
      .selectChildren()
      .data(visualObj.viewModel.groupedLines)
      .join("g")
      .each(function(currLineDataFull: [string, lineData[]]) {
        d3.select(this).classed(currLineDataFull[0] + "-linegroup", true)
        const currLine: string = currLineDataFull[0];
        const currLineData: lineData[] = currLineDataFull[1].filter((d: lineData) => between(d.x, xlower, xupper));
        const n: number = currLineData.length;
        let yValidStatus: boolean[] = new Array<boolean>(n);
        let anyValid: boolean = false;
        let xValues: number[] = new Array<number>(n);
        let yValues: number[] = new Array<number>(n);
        let stroke: string[] = new Array<string>(n);
        let strokeWidth: string[] = new Array<string>(n);
        let strokeDashArray: string[] = new Array<string>(n);
        let conditionalStroke = false;
        let conditionalStrokeWidth = false;
        let conditionalDashArray = false

        for (let i = 0; i < n; i++) {
          const currPoint: lineData = currLineData[i];

          xValues[i] = visualObj.plotProperties.xScale(currPoint.x) as number;
          yValues[i] = visualObj.plotProperties.yScale(currPoint.line_value as number) as number;

          stroke[i] = visualObj.viewModel.colourPalette.isHighContrast
                        ? visualObj.viewModel.colourPalette.foregroundColour
                        : getAesthetic(currLine, "lines", "colour", { lines: currPoint.aesthetics } as settingsValueType) as string;
          strokeWidth[i] =  getAesthetic(currLine, "lines", "width", { lines: currPoint.aesthetics } as settingsValueType) as string;
          strokeDashArray[i] =  getAesthetic(currLine, "lines", "type", { lines: currPoint.aesthetics } as settingsValueType) as string;

          if (i > 0) {
            conditionalStroke = conditionalStroke || (stroke[i] !== stroke[i - 1]);
            conditionalStrokeWidth = conditionalStrokeWidth || (strokeWidth[i] !== strokeWidth[i - 1]);
            conditionalDashArray = conditionalDashArray || (strokeDashArray[i] !== strokeDashArray[i - 1]);
          }

          yValidStatus[i] = !isNullOrUndefined(currPoint.line_value) && between(currPoint.line_value, ylower, yupper);
          anyValid = anyValid || yValidStatus[i];
        }

        const conditionalFormatting = conditionalStroke || conditionalStrokeWidth || conditionalDashArray;

        if (!anyValid) {
          d3.select(this).selectAll("line").remove();
          d3.select(this).selectAll("path").remove();
          return;
        }
        if (conditionalFormatting) {
          d3.select(this).selectAll("path").remove();
          d3.select(this)
            .selectAll("line")
            .data(currLineData.slice(1) as lineData[])
            .join("line")
            .attr("x1", (_, idx: number) => yValidStatus[idx] ? xValues[idx] : xValues[idx + 1])
            .attr("y1", (_, idx: number) => yValidStatus[idx] ? yValues[idx] : yValues[idx + 1])
            .attr("x2", (_, idx: number) => yValidStatus[idx + 1] ? xValues[idx + 1] : xValues[idx])
            .attr("y2", (_, idx: number) => yValidStatus[idx + 1] ? yValues[idx + 1] : yValues[idx])
            .attr("fill", "none")
            .attr("stroke", (_, idx: number) => stroke[idx])
            .attr("stroke-width", (_, idx: number) => strokeWidth[idx])
            .attr("stroke-dasharray", (_, idx: number) => strokeDashArray[idx])
            .attr("stroke-dashoffset", (_, idx: number) => {
                const prev_x: number = visualObj.plotProperties.xScale(currLineData[0].x) as number;
                const curr_x: number = visualObj.plotProperties.xScale(currLineData[idx].x) as number;
                return curr_x - prev_x
            })
        } else {
          d3.select(this).selectAll("line").remove();
          d3.select(this)
          .selectAll("path")
          .data([currLineDataFull[1]])
          .join("path")
          .attr("d", d3.line<lineData>()
                      .x((_, idx: number) => yValidStatus[idx] ? xValues[idx] : xValues[idx + 1])
                      .y((_, idx: number) => yValidStatus[idx] ? yValues[idx] : yValues[idx + 1])
                      .defined((_, idx: number) => yValidStatus[idx]))
          .attr("fill", "none")
          .attr("stroke", (_, idx: number) => stroke[idx])
          .attr("stroke-dasharray", (_, idx: number) => strokeDashArray[idx])
          .attr("stroke-width", (_, idx: number) => strokeWidth[idx])
        }
      })
}
