import * as d3 from "d3";
import viewModelClass from "../Classes/viewModelClass";
import { axisProperties } from "../Classes/plotPropertiesClass";
import {abs} from "../Functions/UnaryFunctions";
import drawXAxis from "./drawXAxis";
import { svgBaseType } from "../visual";

export default function drawYAxis(selection: svgBaseType, viewModel: viewModelClass, refresh?: boolean) {
  selection.selectAll(".yaxisgroup").remove()
  selection.selectAll(".yaxislabel").remove()
  if (!(viewModel.plotProperties.displayPlot)) {
    return;
  }

  const yAxisProperties: axisProperties = viewModel.plotProperties.yAxis;
  let yAxis: d3.Axis<d3.NumberValue>;
  const yaxis_sig_figs: number = viewModel.inputSettings.y_axis.ylimit_sig_figs;
  const sig_figs: number = yaxis_sig_figs === null ? viewModel.inputSettings.spc.sig_figs : yaxis_sig_figs;
  const multiplier: number = viewModel.inputSettings.spc.multiplier;

  if (yAxisProperties.ticks) {
    yAxis = d3.axisLeft(viewModel.plotProperties.yScale);
    if (yAxisProperties.tick_count) {
      yAxis.ticks(yAxisProperties.tick_count)
    }
    yAxis.tickFormat(
      (d: number) => {
        return viewModel.inputData.percentLabels
          ? (d * (multiplier === 100 ? 1 : (multiplier === 1 ? 100 : multiplier))).toFixed(sig_figs) + "%"
          : d.toFixed(sig_figs);
      }
    );
  } else {
    yAxis = d3.axisLeft(viewModel.plotProperties.yScale).tickValues([]);
  }

  selection
      .append('g')
      .classed("yaxisgroup", true)
      .call(yAxis)
      .attr("color", yAxisProperties.colour)
      .attr("transform", `translate(${viewModel.plotProperties.xAxis.start_padding}, 0)`)
      .selectAll(".tick text")
      // Right-align
      .style("text-anchor", "right")
      // Rotate tick labels
      .attr("transform", `rotate(${yAxisProperties.tick_rotation})`)
      // Scale font
      .style("font-size", yAxisProperties.tick_size)
      .style("font-family", yAxisProperties.tick_font)
      .style("fill", yAxisProperties.tick_colour);

  const currNode: SVGGElement = selection.selectAll(".yaxisgroup").selectAll(".tick text").node() as SVGGElement;
  const yAxisCoordinates: DOMRect = currNode.getBoundingClientRect() as DOMRect;

  const settingsPadding: number = viewModel.inputSettings.canvas.left_padding
  const tickLeftofPadding: number = yAxisCoordinates.left - settingsPadding;

  if (tickLeftofPadding < 0) {
    if (!refresh) {
      console.log("refresh")
      const viewModelCopy: viewModelClass = new viewModelClass(viewModel);
      viewModelCopy.plotProperties.xAxis.start_padding += abs(tickLeftofPadding)
      viewModelCopy.plotProperties.initialiseScale();
      selection.call(drawYAxis, viewModelCopy, true).call(drawXAxis, viewModelCopy, true);
      return;
    }
  }

  const leftMidpoint: number = yAxisCoordinates.x * 0.7;
  const y: number = viewModel.plotProperties.height / 2;

  selection
      .append("text")
      .classed("yaxislabel", true)
      .attr("x",leftMidpoint)
      .attr("y", y)
      .attr("transform",`rotate(-90, ${leftMidpoint}, ${y})`)
      .text(yAxisProperties.label)
      .style("text-anchor", "middle")
      .style("font-size", yAxisProperties.label_size)
      .style("font-family", yAxisProperties.label_font)
      .style("fill", yAxisProperties.label_colour);
}
