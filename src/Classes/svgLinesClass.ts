import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import viewModelClass from "./viewModelClass";
import { lineData } from "./viewModelClass";
import between from "../Functions/between";
import getAesthetic from "../Functions/getAesthetic";
import ISelectionId = powerbi.visuals.ISelectionId;
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgLinesClass {
  linesGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.linesGroup.selectAll(".linesgroup").remove()
    if (!(viewModel.groupedLines)) {
      return;
    }
    const lower: number = viewModel.plotProperties.yAxis.lower;
    const upper: number = viewModel.plotProperties.yAxis.upper;

    this.linesGroup
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
        .attr("stroke", d => {
          return viewModel.plotProperties.displayPlot
                  ? getAesthetic(d[0], "lines", "colour", viewModel.inputSettings)
                  : "#FFFFFF"
        })
        .attr("stroke-width", d => {
          return getAesthetic(d[0], "lines", "width", viewModel.inputSettings)
        })
        .attr("stroke-dasharray", d => {
          return getAesthetic(d[0], "lines", "type", viewModel.inputSettings)
        });
  }

  highlight(anyHighlights: boolean, allSelectionIDs: ISelectionId[],
            opacityFull: number, opacityReduced: number): void {
    const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                      ? opacityReduced
                                      : opacityFull;
    this.linesGroup.style("stroke-opacity", defaultOpacity);
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.linesGroup = svg.append("g");
  }
}
export default svgLinesClass
