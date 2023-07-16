import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import viewModelClass from "./viewModelClass";
import { plotData } from "./viewModelClass";
import between from "../Functions/between";
import ISelectionId = powerbi.visuals.ISelectionId;
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgDotsClass {
  dotsGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.dotsGroup.selectAll(".dotsgroup").remove()
    if (!(viewModel.plotProperties.displayPlot)) {
      return;
    }
    const lower: number = viewModel.plotProperties.yAxis.lower;
    const upper: number = viewModel.plotProperties.yAxis.upper;

    this.dotsGroup
        .append('g')
        .classed("dotsgroup", true)
        .selectAll(".dotsgroup")
        .data(viewModel.plotPoints)
        .enter()
        .append("circle")
        .filter((d: plotData) => d.value !== null)
        .attr("cy", (d: plotData) => viewModel.plotProperties.yScale(d.value))
        .attr("cx", (d: plotData) => viewModel.plotProperties.xScale(d.x))
        .attr("r", (d: plotData) => d.aesthetics.size)
        .style("fill", (d: plotData) => {
          return between(d.value, lower, upper) ? d.aesthetics.colour : "#FFFFFF";
        })
  }

  highlight(anyHighlights: boolean, allSelectionIDs: ISelectionId[],
            opacityFull: number, opacityReduced: number): void {
    const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                      ? opacityReduced
                                      : opacityFull;
    this.dotsGroup.selectAll(".dotsgroup").selectChildren().style("fill-opacity", defaultOpacity);
    if (anyHighlights || (allSelectionIDs.length > 0)) {
      this.dotsGroup.selectAll(".dotsgroup").selectChildren().style("fill-opacity", (dot: plotData) => {
        const currentPointSelected: boolean = allSelectionIDs.some((currentSelectionId: ISelectionId) => {
          return currentSelectionId.includes(dot.identity);
        });
        const currentPointHighlighted: boolean = dot.highlighted;
        return (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
      })
    }
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.dotsGroup = svg.append("g");
  }
}
export default svgDotsClass
