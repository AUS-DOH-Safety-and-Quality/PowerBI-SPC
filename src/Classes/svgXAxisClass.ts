import * as d3 from "d3";
import viewModelClass from "./viewModelClass";
import { axisProperties } from "./plotPropertiesClass";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgXAxisClass {
  xAxisGroup: SelectionBase;
  refreshingAxis: boolean

  draw(viewModel: viewModelClass): void {
    this.xAxisGroup.selectAll(".xaxisgroup").remove()
    this.xAxisGroup.selectAll(".xaxislabel").remove()
    if (!(viewModel.plotProperties.displayPlot)) {
      return;
    }

    const xAxisProperties: axisProperties = viewModel.plotProperties.xAxis;
    let xAxis: d3.Axis<d3.NumberValue>;

    if (xAxisProperties.ticks) {
      xAxis = d3.axisBottom(viewModel.plotProperties.xScale);
      if (xAxisProperties.tick_count) {
        xAxis.ticks(xAxisProperties.tick_count)
      }
      if (viewModel.tickLabels) {
        xAxis.tickFormat(d => {
          return viewModel.tickLabels.map(d => d.x).includes(<number>d)
            ? viewModel.tickLabels[<number>d].label
            : "";
        })
      }
    } else {
      xAxis = d3.axisBottom(viewModel.plotProperties.xScale).tickValues([]);
    }

    const axisHeight: number = viewModel.plotProperties.height - viewModel.plotProperties.yAxis.end_padding;

    this.xAxisGroup
        .append('g')
        .classed("xaxisgroup", true)
        .call(xAxis)
        .attr("color", xAxisProperties.colour)
        // Plots the axis at the correct height
        .attr("transform", "translate(0, " + axisHeight + ")")
        .selectAll(".tick text")
        // Right-align
        .style("text-anchor", xAxisProperties.tick_rotation < 0.0 ? "end" : "start")
        // Rotate tick labels
        .attr("dx", xAxisProperties.tick_rotation < 0.0 ? "-.8em" : ".8em")
        .attr("dy", xAxisProperties.tick_rotation < 0.0 ? "-.15em" : ".15em")
        .attr("transform","rotate(" + xAxisProperties.tick_rotation + ")")
        // Scale font
        .style("font-size", xAxisProperties.tick_size)
        .style("font-family", xAxisProperties.tick_font)
        .style("fill", xAxisProperties.tick_colour);

    const currNode: SVGGElement = this.xAxisGroup.selectAll(".xaxisgroup").selectChildren().node() as SVGGElement;
    const xAxisCoordinates: DOMRect = currNode.getBoundingClientRect() as DOMRect;

    // Update padding and re-draw axis if large tick values rendered outside of plot
    const tickBelowPlotAmount: number = xAxisCoordinates.bottom - viewModel.plotProperties.height;
    const tickLeftofPlotAmount: number = xAxisCoordinates.left;
    if ((tickBelowPlotAmount > 0 || tickLeftofPlotAmount < 0)) {
      if (!this.refreshingAxis) {
        this.refreshingAxis = true
        viewModel.plotProperties.yAxis.end_padding += tickBelowPlotAmount;
        viewModel.plotProperties.initialiseScale();
        this.draw(viewModel);
      }
    }
    this.refreshingAxis = false

    const bottomMidpoint: number = viewModel.plotProperties.height - (viewModel.plotProperties.height - xAxisCoordinates.bottom) / 2.5;
    this.xAxisGroup
        .append("text")
        .classed("xaxislabel", true)
        .attr("x",viewModel.plotProperties.width/2)
        .attr("y", bottomMidpoint)
        .style("text-anchor", "middle")
        .text(xAxisProperties.label)
        .style("font-size", xAxisProperties.label_size)
        .style("font-family", xAxisProperties.label_font)
        .style("fill", xAxisProperties.label_colour);
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.xAxisGroup = svg.append("g");
  }
}
export default svgXAxisClass
