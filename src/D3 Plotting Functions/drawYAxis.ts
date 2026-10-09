import * as d3 from "./D3 Modules";
import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type { axisProperties } from "../Classes/plotPropertiesClass";
import type { svgBaseType, Visual } from "../visual";
import { drawGridlines, axisLabelPlacement } from "powerbi-visuals-core/rendering";

export default function drawYAxis(selection: svgBaseType, visualObj: Visual) {
  const existingGroup = selection.select<SVGGElement>(".yaxisgroup");
  const existingLabel = selection.select<SVGTextElement>(".yaxislabel");
  if (!visualObj.viewModel.inputSettings.settings[0].y_axis.ylimit_show) {
    // Y Axis plotting is disabled, so remove any existing axis and return early
    existingGroup.remove();
    existingLabel.remove();
    selection.selectAll(".ygridline").remove();
    return;
  }
  // Re-added axis elements go back beneath the lines and dots
  const yAxisGroup = existingGroup.empty()
    ? selection.insert<SVGGElement>("g", ".linesgroup").classed("yaxisgroup", true)
    : existingGroup;
  if (existingLabel.empty()) {
    selection.insert("text", ".linesgroup").classed("yaxislabel", true);
  }

  const yAxisProperties: axisProperties = visualObj.plotProperties.yAxis;
  const yAxis: d3.Axis<number> = d3.axisLeft(visualObj.plotProperties.yScale);
  yAxis.tickSizeOuter(yAxisProperties.tick_marks ? 6 : 0);
  const yaxis_sig_figs: number | undefined = visualObj.viewModel.inputSettings.settings[0].y_axis.ylimit_sig_figs;
  const sig_figs: number = isNullOrUndefined(yaxis_sig_figs) ? visualObj.viewModel.inputSettings.settings[0].spc.sig_figs : yaxis_sig_figs;
  const displayPlot: boolean = visualObj.plotProperties.displayPlot;

  if (yAxisProperties.ticks) {
    if (yAxisProperties.tick_count) {
      yAxis.ticks(yAxisProperties.tick_count)
    }
    if (visualObj.viewModel.inputData.length > 0 && visualObj.viewModel.inputData[0]) {
      const derivedSettings = visualObj.viewModel.inputSettings.derivedSettings[0];
      yAxis.tickFormat(
        (d: number) => {
          return derivedSettings.percentLabels
            ? d.valueOf().toFixed(sig_figs) + "%"
            : d.valueOf().toFixed(sig_figs);
        }
      );
    }
  } else {
    yAxis.tickValues([]);
  }

  yAxisGroup
      .call(yAxis)
      .attr("color", displayPlot ? yAxisProperties.colour : "#FFFFFF")
      .attr("transform", `translate(${visualObj.plotProperties.xAxis.start_padding}, 0)`)
      .selectAll(".tick text")
      // Right-align
      .style("text-anchor", "right")
      // Rotate tick labels
      .attr("transform", `rotate(${yAxisProperties.tick_rotation})`)
      // Scale font
      .style("font-size", yAxisProperties.tick_size)
      .style("font-family", yAxisProperties.tick_font)
      .style("fill", displayPlot ? yAxisProperties.tick_colour : "#FFFFFF");

  yAxisGroup.selectAll(".tick line")
      .style("stroke", yAxisProperties.tick_marks ? "currentColor" : "none");
  const gridGroup = selection.select<SVGGElement>(".gridgroup").node();
  if (gridGroup !== null) {
    drawGridlines({
      container: gridGroup, className: "ygridline", orientation: "horizontal",
      values: yAxisProperties.grid_show ? yAxisGroup.selectAll<SVGGElement, number>(".tick").data() : [],
      scale: (value: number) => visualObj.plotProperties.yScale(value) as number,
      from: visualObj.plotProperties.xAxis.start_padding, to: visualObj.viewModel.svgWidth - visualObj.plotProperties.xAxis.end_padding,
      colour: displayPlot ? yAxisProperties.grid_colour : "#FFFFFF",
      width: yAxisProperties.grid_width
    });
  }

  let textX: number;
  const label = axisLabelPlacement(yAxisProperties.label_align, visualObj.viewModel.svgHeight - yAxisProperties.start_padding,
                                   yAxisProperties.end_padding);
  const textY: number = label.position;
  if (visualObj.viewModel.frontend) {
    // Non-PBI fronted doesn't have good bbox/boundingClientRect support
    // so use padding as best approximation
    textX = visualObj.plotProperties.xAxis.start_padding / 2;
  } else {
    const yAxisNode: SVGGElement = selection.selectAll(".yaxisgroup").node() as SVGGElement;
    if (!yAxisNode) {
      selection.select(".yaxislabel")
                .style("fill", displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
      return;
    }
    const svgLeft = visualObj.svg.node()!.getBoundingClientRect().left;
    textX = (yAxisNode.getBoundingClientRect().x - svgLeft) * 0.7;
  }

  selection.select(".yaxislabel")
      .attr("x", textX)
      .attr("y", textY)
      .attr("transform", `rotate(-90, ${textX}, ${textY})`)
      .text(yAxisProperties.label)
      .style("text-anchor", label.anchor)
      .style("font-size", yAxisProperties.label_size)
      .style("font-style", yAxisProperties.label_style)
      .style("font-family", yAxisProperties.label_font)
      .style("fill", displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
}
