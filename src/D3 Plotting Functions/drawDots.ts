import * as d3 from "d3";
import viewModelClass from "../Classes/viewModelClass";
import { plotData } from "../Classes/viewModelClass";
import between from "../Functions/between";

type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

export default function drawDots(selection: SelectionBase, viewModel: viewModelClass) {
  selection.selectAll(".dotsgroup").remove()
  if (!(viewModel.plotProperties.displayPlot)) {
    return;
  }
  const lower: number = viewModel.plotProperties.yAxis.lower;
  const upper: number = viewModel.plotProperties.yAxis.upper;

  selection
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
