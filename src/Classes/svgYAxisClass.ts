import * as d3 from "d3";
import viewModelClass from "./viewModelClass";
import { axisProperties } from "./plotPropertiesClass";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgYAxisClass {
  yAxisGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.yAxisGroup.selectAll(".yaxisgroup").remove()
    this.yAxisGroup.selectAll(".yaxislabel").remove()
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
        d => {
          return viewModel.inputData.percentLabels
            ? (<number>d * (multiplier === 100 ? 1 : (multiplier === 1 ? 100 : multiplier))).toFixed(sig_figs) + "%"
            : (<number>d).toFixed(sig_figs);
        }
      );
    } else {
      yAxis = d3.axisLeft(viewModel.plotProperties.yScale).tickValues([]);
    }

    this.yAxisGroup
        .append('g')
        .classed("yaxisgroup", true)
        .call(yAxis)
        .attr("color", yAxisProperties.colour)
        .attr("transform", "translate(" + viewModel.plotProperties.xAxis.start_padding + ",0)")
        .selectAll(".tick text")
        // Right-align
        .style("text-anchor", "right")
        // Rotate tick labels
        .attr("transform","rotate(" + yAxisProperties.tick_rotation + ")")
        // Scale font
        .style("font-size", yAxisProperties.tick_size)
        .style("font-family", yAxisProperties.tick_font)
        .style("fill", yAxisProperties.tick_colour);

    const currNode: SVGGElement = this.yAxisGroup.selectAll(".yaxisgroup").selectChildren().node() as SVGGElement;
    const yAxisCoordinates: DOMRect = currNode.getBoundingClientRect() as DOMRect;
    const leftMidpoint: number = yAxisCoordinates.x * 0.7;

    this.yAxisGroup
        .append("text")
        .classed("yaxislabel", true)
        .attr("x",leftMidpoint)
        .attr("y",viewModel.plotProperties.height/2)
        .attr("transform","rotate(-90," + leftMidpoint +"," + viewModel.plotProperties.height/2 +")")
        .text(yAxisProperties.label)
        .style("text-anchor", "middle")
        .style("font-size", yAxisProperties.label_size)
        .style("font-family", yAxisProperties.label_font)
        .style("fill", yAxisProperties.label_colour);
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.yAxisGroup = svg.append("g");
  }
}
export default svgYAxisClass
