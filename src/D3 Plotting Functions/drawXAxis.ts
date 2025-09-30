import * as d3 from "./D3 Modules";
import type { axisProperties } from "../Classes";
import type { svgBaseType, Visual } from "../visual";

export default function drawXAxis(selection: svgBaseType, visualObj: Visual) {
  const xAxisProperties: axisProperties = visualObj.viewModel.plotProperties.xAxis;
  const xAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(visualObj.viewModel.plotProperties.xScale);

  if (xAxisProperties.ticks) {
    if (xAxisProperties.tick_count) {
      xAxis.ticks(xAxisProperties.tick_count)
    }
    if (visualObj.viewModel.tickLabels) {
      xAxis.tickFormat(axisX => {
        const targetKey = visualObj.viewModel.tickLabels.filter(d => d.x == <number>axisX);
        return targetKey.length > 0 ? targetKey[0].label : "";

      })
    }
  } else {
    xAxis.tickValues([]);
  }

  const plotHeight: number = visualObj.viewModel.svgHeight;
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

  const xAxisNode: SVGGElement = selection.selectAll(".xaxisgroup").node() as SVGGElement;
  if (!xAxisNode) {
    selection.select(".xaxislabel")
              .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
    return;
  }
  const textX: number = visualObj.viewModel.svgWidth / 2;
  let textY: number;

  if (visualObj.viewModel.frontend) {
    // Non-PBI fronted doesn't have good bbox/boundingClientRect support
    // so use padding as best approximation
    textY = visualObj.viewModel.plotProperties.yAxis.start_padding - visualObj.viewModel.inputSettings.settings.x_axis.xlimit_label_size * 0.5;
  } else {
    const xAxisCoordinates: DOMRect = xAxisNode.getBoundingClientRect() as DOMRect;
    textY = plotHeight - ((plotHeight - xAxisCoordinates.bottom) / 2);
  }

  selection.select(".xaxislabel")
            .attr("x", textX)
            .attr("y", textY)
            .style("text-anchor", "middle")
            .text(xAxisProperties.label)
            .style("font-size", xAxisProperties.label_size)
            .style("font-family", xAxisProperties.label_font)
            .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
}
