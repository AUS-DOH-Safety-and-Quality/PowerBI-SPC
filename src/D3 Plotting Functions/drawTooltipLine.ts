import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import ITooltipService = powerbi.extensibility.ITooltipService
import viewModelClass from "../Classes/viewModelClass";
import { svgBaseType } from "../visual";
import plotPropertiesClass from "../Classes/plotPropertiesClass";
import { plotData } from "../Classes/viewModelClass";

export default function drawTooltipLine(selection: svgBaseType, viewModel: viewModelClass, tooltipService: ITooltipService) {
  selection.selectAll(".ttip-line").remove()
  if (!(viewModel.plotProperties.displayPlot)) {
    selection.on("mousemove", () => { return; })
              .on("mouseleave", () => { return; })
    return;
  }

  const xAxisLine = selection.append('g')
            .classed("ttip-line", true)
            .selectAll(".ttip-line")
            .data(viewModel.plotPoints)
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", viewModel.plotProperties.yAxis.end_padding)
            .attr("y2", viewModel.plotProperties.height - viewModel.plotProperties.yAxis.start_padding)
            .attr("stroke-width", "1px")
            .attr("stroke", "black")
            .style("stroke-opacity", 0);

  selection.on("mousemove", (event) => {
              const plotProperties: plotPropertiesClass = viewModel.plotProperties;
              const plotPoints: plotData[] = viewModel.plotPoints

              const xValue: number = plotProperties.xScale.invert(event.pageX);
              const xRange: number[] = plotPoints.map(d => d.x).map(d => Math.abs(d - xValue));
              const nearestDenominator: number = d3.leastIndex(xRange,(a,b) => a-b);
              const x_coord: number = plotProperties.xScale(plotPoints[nearestDenominator].x)
              const y_coord: number = plotProperties.yScale(plotPoints[nearestDenominator].value)

              tooltipService.show({
                dataItems: plotPoints[nearestDenominator].tooltip,
                identities: [plotPoints[nearestDenominator].identity],
                coordinates: [x_coord, y_coord],
                isTouchEvent: false
              });
              xAxisLine.style("stroke-opacity", 1)
                        .attr("x1", x_coord)
                        .attr("x2", x_coord);
            })
            .on("mouseleave", () => {
              tooltipService.hide({ immediately: true, isTouchEvent: false });
              xAxisLine.style("stroke-opacity", 0);
            });
}
