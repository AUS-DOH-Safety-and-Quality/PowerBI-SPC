import * as d3 from "./D3 Modules";
import type { axisProperties } from "../Classes/plotPropertiesClass";
import { abs } from "../Functions/broadcastUnary";
import type { svgBaseType, Visual } from "../visual";

export default function drawXAxis(selection: svgBaseType, visualObj: Visual, refresh?: boolean) {
  const xAxisProperties: axisProperties = visualObj.viewModel.plotProperties.xAxis;
  const xAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(visualObj.viewModel.plotProperties.xScale);

  if (xAxisProperties.ticks) {
    if (xAxisProperties.tick_count) {
      xAxis.ticks(xAxisProperties.tick_count)
    }
    if (visualObj.viewModel.tickLabels) {
      xAxis.tickFormat(d => {
        return visualObj.viewModel.tickLabels.map(d => d.x).includes(<number>d)
          ? visualObj.viewModel.tickLabels[<number>d].label
          : "";
      })
    }
  } else {
    xAxis.tickValues([]);
  }

  const plotHeight: number = visualObj.viewModel.plotProperties.height;
  const xAxisHeight: number = plotHeight - visualObj.viewModel.plotProperties.yAxis.start_padding;
  const displayPlot: boolean = visualObj.viewModel.plotProperties.displayPlot;
  const xAxisGroup = selection.select(".xaxisgroup") as d3.Selection<SVGGElement, unknown, null, undefined>;

  xAxisGroup
      .call(xAxis)
      .attr("color", displayPlot ? xAxisProperties.colour : "#FFFFFF")
      // Plots the axis at the correct height
      .attr("transform", `translate(0, ${xAxisHeight})`)
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
      .style("fill", displayPlot ? xAxisProperties.tick_colour : "#FFFFFF");

  const axisNode: SVGGElement = selection.selectAll(".xaxisgroup").selectAll(".tick text").node() as SVGGElement;
  const xAxisCoordinates: DOMRect = axisNode.getBoundingClientRect() as DOMRect;

  // Update padding and re-draw axis if large tick values rendered outside of plot
  const tickBelowPadding: number = xAxisCoordinates.bottom - xAxisHeight;
  const tickLeftofPadding: number = xAxisCoordinates.left - xAxisProperties.start_padding;

  if ((tickBelowPadding > 0 || tickLeftofPadding < 0)) {
    if (!refresh) {
      if (tickBelowPadding > 0) {
        visualObj.viewModel.plotProperties.yAxis.start_padding += abs(tickBelowPadding);
      }
      if (tickLeftofPadding < 0) {
        visualObj.viewModel.plotProperties.xAxis.start_padding += abs(tickLeftofPadding)
      }
      visualObj.viewModel.plotProperties.initialiseScale();
      selection.call(drawXAxis, visualObj, true);
      return;
    }
  }

  const bottomMidpoint: number = plotHeight - ((plotHeight - xAxisCoordinates.bottom) / 2);

  selection.select(".xaxislabel")
            .attr("x",visualObj.viewModel.plotProperties.width / 2)
            .attr("y", bottomMidpoint)
            .style("text-anchor", "middle")
            .text(xAxisProperties.label)
            .style("font-size", xAxisProperties.label_size)
            .style("font-family", xAxisProperties.label_font)
            .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
}
