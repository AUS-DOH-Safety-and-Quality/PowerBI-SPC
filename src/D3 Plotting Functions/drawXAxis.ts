import * as d3 from "./D3 Modules";
import type { axisProperties } from "../Classes/plotPropertiesClass";
import type { svgBaseType, Visual } from "../visual";

export default function drawXAxis(selection: svgBaseType, visualObj: Visual) {
  const existingGroup = selection.select<SVGGElement>(".xaxisgroup");
  const existingLabel = selection.select<SVGTextElement>(".xaxislabel");
  if (!visualObj.viewModel.inputSettings.settings[0].x_axis.xlimit_show) {
    // X Axis plotting is disabled, so remove any existing axis and return early
    existingGroup.remove();
    existingLabel.remove();
    selection.selectAll(".xgridline").remove();
    return;
  }
  // Re-added axis elements go back beneath the lines and dots
  const xAxisGroup = existingGroup.empty()
    ? selection.insert<SVGGElement>("g", ".linesgroup").classed("xaxisgroup", true)
    : existingGroup;
  if (existingLabel.empty()) {
    selection.insert("text", ".linesgroup").classed("xaxislabel", true);
  }

  const xAxisProperties: axisProperties = visualObj.plotProperties.xAxis;
  const xAxis: d3.Axis<number> = d3.axisBottom(visualObj.plotProperties.xScale);
  xAxis.tickSizeOuter(xAxisProperties.tick_marks ? 6 : 0);

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
  const xAxisHeight: number = plotHeight - visualObj.plotProperties.yAxis.start_padding;
  const displayPlot: boolean = visualObj.plotProperties.displayPlot;
  const tickOffsets: Record<number, { anchor: string; dx: string; dy: string }> = {
    "-1": { anchor: "end", dx: "-.8em", dy: "-.15em" },
    "0": { anchor: "middle", dx: "0em", dy: ".71em" },
    "1": { anchor: "start", dx: ".8em", dy: ".15em" }
  };
  const tickOffset = tickOffsets[Math.sign(xAxisProperties.tick_rotation)];
  xAxisGroup
      .call(xAxis)
      .attr("color", displayPlot ? xAxisProperties.colour : "#FFFFFF")
      // Plots the axis at the correct height
      .attr("transform", `translate(0, ${xAxisHeight})`)
      .selectAll(".tick text")
      // Right-align
      .style("text-anchor", tickOffset.anchor)
      // Rotate tick labels
      .attr("dx", tickOffset.dx)
      .attr("dy", tickOffset.dy)
      .attr("transform","rotate(" + xAxisProperties.tick_rotation + ")")
      // Scale font
      .style("font-size", xAxisProperties.tick_size)
      .style("font-family", xAxisProperties.tick_font)
      .style("fill", displayPlot ? xAxisProperties.tick_colour : "#FFFFFF");

  xAxisGroup.selectAll(".tick line")
      .style("stroke", xAxisProperties.tick_marks ? "currentColor" : "none");
  const xTicks = xAxisProperties.grid_show ? xAxisGroup.selectAll<SVGGElement, number>(".tick").data() : [];
  selection.select(".gridgroup")
      .selectAll(".xgridline")
      .data(xTicks)
      .join("line")
      .classed("xgridline", true)
      .attr("x1", d => visualObj.plotProperties.xScale(d)!)
      .attr("x2", d => visualObj.plotProperties.xScale(d)!)
      .attr("y1", xAxisHeight)
      .attr("y2", visualObj.plotProperties.yAxis.end_padding)
      .style("stroke", displayPlot ? xAxisProperties.grid_colour : "#FFFFFF")
      .style("stroke-width", xAxisProperties.grid_width);

  const labelPosition: Record<string, { x: number; anchor: string }> = {
      left: { x: visualObj.plotProperties.xAxis.start_padding, anchor: "start" },
      center: { x: visualObj.viewModel.svgWidth / 2, anchor: "middle" },
      right: { x: visualObj.viewModel.svgWidth - visualObj.plotProperties.xAxis.end_padding, anchor: "end" }
  };
  const textX: number = labelPosition[xAxisProperties.label_align].x;
  let textY: number;

  if (visualObj.viewModel.frontend) {
    // Non-PBI fronted doesn't have good bbox/boundingClientRect support
    // so use padding as best approximation
    textY = plotHeight - (visualObj.plotProperties.yAxis.start_padding / 3);
  } else {
    const xAxisNode: SVGGElement = selection.selectAll(".xaxisgroup").node() as SVGGElement;
    if (!xAxisNode) {
      selection.select(".xaxislabel")
                .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
      return;
    }
    const svgTop = visualObj.svg.node()!.getBoundingClientRect().top;
    const xAxisBottom = xAxisNode.getBoundingClientRect().bottom - svgTop;
    textY = plotHeight - ((plotHeight - xAxisBottom) / 2);
  }

  selection.select(".xaxislabel")
            .attr("x", textX)
            .attr("y", textY)
            .style("text-anchor", labelPosition[xAxisProperties.label_align].anchor)
            .text(xAxisProperties.label)
            .style("font-size", xAxisProperties.label_size)
            .style("font-style", xAxisProperties.label_style)
            .style("font-family", xAxisProperties.label_font)
            .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
}
