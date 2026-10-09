import * as d3 from "./D3 Modules";
import type { axisProperties } from "../Classes/plotPropertiesClass";
import type { svgBaseType, Visual } from "../visual";
import { drawGridlines, axisLabelPlacement } from "powerbi-visuals-core/rendering";

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
  const gridGroup = selection.select<SVGGElement>(".gridgroup").node();
  if (gridGroup !== null) {
    drawGridlines({
      container: gridGroup, className: "xgridline", orientation: "vertical",
      values: xAxisProperties.grid_show ? xAxisGroup.selectAll<SVGGElement, number>(".tick").data() : [],
      scale: (value: number) => visualObj.plotProperties.xScale(value) as number,
      from: xAxisHeight, to: visualObj.plotProperties.yAxis.end_padding,
      colour: displayPlot ? xAxisProperties.grid_colour : "#FFFFFF",
      width: xAxisProperties.grid_width
    });
  }

  const label = axisLabelPlacement(xAxisProperties.label_align, xAxisProperties.start_padding,
                                   visualObj.viewModel.svgWidth - xAxisProperties.end_padding);
  const textX: number = label.position;
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
            .style("text-anchor", label.anchor)
            .text(xAxisProperties.label)
            .style("font-size", xAxisProperties.label_size)
            .style("font-style", xAxisProperties.label_style)
            .style("font-family", xAxisProperties.label_font)
            .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
}
