import * as d3 from "./D3 Modules";
import isNullOrUndefined from "../Functions/isNullOrUndefined";
import type { axisProperties } from "../Classes/plotPropertiesClass";
import type { svgBaseType, Visual } from "../visual";

export default function drawYAxis(selection: svgBaseType, visualObj: Visual) {
  const yAxisProperties: axisProperties = visualObj.plotProperties.yAxis;
  const yAxis: d3.Axis<d3.NumberValue> = d3.axisLeft(visualObj.plotProperties.yScale);
  const yaxis_sig_figs: number = visualObj.viewModel.inputSettings.settings[0].y_axis.ylimit_sig_figs;
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
            ? d.toFixed(sig_figs) + "%"
            : d.toFixed(sig_figs);
        }
      );
    }
  } else {
    yAxis.tickValues([]);
  }
  const yAxisGroup = selection.select(".yaxisgroup") as d3.Selection<SVGGElement, unknown, null, undefined>;

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

    let textX: number;
    const textY: number = visualObj.viewModel.svgHeight / 2;
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
      const yAxisCoordinates: DOMRect = yAxisNode.getBoundingClientRect() as DOMRect;
      textX = yAxisCoordinates.x * 0.7;
    }

    selection.select(".yaxislabel")
        .attr("x", textX)
        .attr("y", textY)
        .attr("transform", `rotate(-90, ${textX}, ${textY})`)
        .text(yAxisProperties.label)
        .style("text-anchor", "middle")
        .style("font-size", yAxisProperties.label_size)
        .style("font-family", yAxisProperties.label_font)
        .style("fill", displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
}
