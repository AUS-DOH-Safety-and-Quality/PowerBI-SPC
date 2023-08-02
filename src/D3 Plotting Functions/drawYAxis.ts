import * as d3 from "./D3 Modules";
import { abs } from "../Functions";
import drawXAxis from "./drawXAxis";
import type { axisProperties } from "../Classes";
import type { svgBaseType, Visual } from "../visual";

export default function drawYAxis(selection: svgBaseType, visualObj: Visual, refresh?: boolean) {
  const yAxisProperties: axisProperties = visualObj.viewModel.plotProperties.yAxis;
  const yAxis: d3.Axis<d3.NumberValue> = d3.axisLeft(visualObj.viewModel.plotProperties.yScale);
  const yaxis_sig_figs: number = visualObj.viewModel.inputSettings.settings.y_axis.ylimit_sig_figs;
  const sig_figs: number = yaxis_sig_figs === null ? visualObj.viewModel.inputSettings.settings.spc.sig_figs : yaxis_sig_figs;
  const multiplier: number = visualObj.viewModel.inputSettings.settings.spc.multiplier;
  const displayPlot: boolean = visualObj.viewModel.plotProperties.displayPlot;

  if (yAxisProperties.ticks) {
    if (yAxisProperties.tick_count) {
      yAxis.ticks(yAxisProperties.tick_count)
    }
    if (visualObj.viewModel.inputData) {
      yAxis.tickFormat(
        (d: number) => {
          return visualObj.viewModel.inputData.percentLabels
            ? (d * (multiplier === 100 ? 1 : (multiplier === 1 ? 100 : multiplier))).toFixed(sig_figs) + "%"
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
      .attr("transform", `translate(${visualObj.viewModel.plotProperties.xAxis.start_padding}, 0)`)
      .selectAll(".tick text")
      // Right-align
      .style("text-anchor", "right")
      // Rotate tick labels
      .attr("transform", `rotate(${yAxisProperties.tick_rotation})`)
      // Scale font
      .style("font-size", yAxisProperties.tick_size)
      .style("font-family", yAxisProperties.tick_font)
      .style("fill", displayPlot ? yAxisProperties.tick_colour : "#FFFFFF");

  const yAxisNode: SVGGElement = selection.selectAll(".yaxisgroup").selectAll(".tick text").node() as SVGGElement;
  if (!yAxisNode) {
    selection.select(".yaxislabel")
              .style("fill", displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
    return;
  }
  const yAxisCoordinates: DOMRect = yAxisNode.getBoundingClientRect() as DOMRect;

  const settingsPadding: number = visualObj.viewModel.inputSettings.settings.canvas.left_padding
  const tickLeftofPadding: number = yAxisCoordinates.left - settingsPadding;

  if (tickLeftofPadding < 0) {
    if (!refresh) {
      visualObj.viewModel.plotProperties.xAxis.start_padding += abs(tickLeftofPadding)
      visualObj.viewModel.plotProperties.initialiseScale();
      selection.call(drawYAxis, visualObj, true).call(drawXAxis, visualObj, true);
      return;
    }
  }

  const leftMidpoint: number = yAxisCoordinates.x * 0.7;
  const y: number = visualObj.viewModel.plotProperties.height / 2;

  selection.select(".yaxislabel")
      .attr("x",leftMidpoint)
      .attr("y", y)
      .attr("transform",`rotate(-90, ${leftMidpoint}, ${y})`)
      .text(yAxisProperties.label)
      .style("text-anchor", "middle")
      .style("font-size", yAxisProperties.label_size)
      .style("font-family", yAxisProperties.label_font)
      .style("fill", displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
}
