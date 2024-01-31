import * as d3 from "./D3 Modules";
import type { svgBaseType, Visual } from "../visual";
import type { plotData, plotPropertiesClass } from "../Classes";

export default function drawTooltipLine(selection: svgBaseType, visualObj: Visual) {
  const plotProperties: plotPropertiesClass = visualObj.viewModel.plotProperties;
  const xAxisLine = selection
            .select(".ttip-line-x")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", plotProperties.yAxis.end_padding)
            .attr("y2", plotProperties.height - plotProperties.yAxis.start_padding)
            .attr("stroke-width", "1px")
            .attr("stroke", "black")
            .style("stroke-opacity", 0);
  const yAxisLine = selection
            .select(".ttip-line-y")
            .attr("x1", plotProperties.xAxis.start_padding)
            .attr("x2", plotProperties.width - plotProperties.xAxis.end_padding)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke-width", "1px")
            .attr("stroke", "black")
            .style("stroke-opacity", 0);

  selection.on("mousemove", (event) => {
    if (!plotProperties.displayPlot) {
      return;
    }
    const plotPoints: plotData[] = visualObj.viewModel.plotPoints

    const xValue: number = plotProperties.xScale.invert(event.pageX);
    const xRange: number[] = plotPoints.map(d => d.x).map(d => Math.abs(d - xValue));
    const nearestDenominator: number = d3.leastIndex(xRange,(a,b) => a-b);
    const x_coord: number = plotProperties.xScale(plotPoints[nearestDenominator].x)
    const y_coord: number = plotProperties.yScale(plotPoints[nearestDenominator].value)

    visualObj.host.tooltipService.show({
      dataItems: plotPoints[nearestDenominator].tooltip,
      identities: [plotPoints[nearestDenominator].identity],
      coordinates: [x_coord, y_coord],
      isTouchEvent: false
    });
    xAxisLine.style("stroke-opacity", 0.4)
              .attr("x1", x_coord)
              .attr("x2", x_coord);
    yAxisLine.style("stroke-opacity", 0.4)
              .attr("y1", y_coord)
              .attr("y2", y_coord);
  })
  .on("mouseleave", () => {
    if (!plotProperties.displayPlot) {
      return;
    }
    visualObj.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
    xAxisLine.style("stroke-opacity", 0);
    yAxisLine.style("stroke-opacity", 0);
  });
}
