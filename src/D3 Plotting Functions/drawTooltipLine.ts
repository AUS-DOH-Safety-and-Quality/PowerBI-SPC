import * as d3 from "./D3 Modules";
import type { svgBaseType, Visual } from "../visual";
import type { plotData, plotPropertiesClass } from "../Classes";

export default function drawTooltipLine(selection: svgBaseType, visualObj: Visual) {
  const plotProperties: plotPropertiesClass = visualObj.plotProperties;
  const colour: string = visualObj.viewModel.colourPalette.isHighContrast
    ? visualObj.viewModel.colourPalette.foregroundColour
    : "black";
  const xAxisLine = selection
            .select(".ttip-line-x")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", plotProperties.yAxis.end_padding)
            .attr("y2", visualObj.viewModel.svgHeight - plotProperties.yAxis.start_padding)
            .attr("stroke-width", "1px")
            .attr("stroke", colour)
            .style("stroke-opacity", 0);
  const yAxisLine = selection
            .select(".ttip-line-y")
            .attr("x1", plotProperties.xAxis.start_padding)
            .attr("x2", visualObj.viewModel.svgWidth - plotProperties.xAxis.end_padding)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke-width", "1px")
            .attr("stroke", colour)
            .style("stroke-opacity", 0);

  selection.on("mousemove", (event) => {
    if (!plotProperties.displayPlot) {
      return;
    }
    const plotPoints: plotData[] = visualObj.viewModel.plotPoints

    const boundRect = visualObj.svg.node().getBoundingClientRect();
    const xValue: number = plotProperties.xScale.invert(event.pageX - boundRect.left);
    const yValue: number = plotProperties.yScale.invert(event.pageY - boundRect.top);
    const distances: number[] = plotPoints.map(d => Math.sqrt(
      Math.pow(d.x - xValue, 2) + Math.pow(d.value - yValue, 2)
    ));
    const indexNearestValue: number = d3.leastIndex(distances,(a,b) => a-b);
    const x_coord: number = plotProperties.xScale(plotPoints[indexNearestValue].x)
    const y_coord: number = plotProperties.yScale(plotPoints[indexNearestValue].value)

    visualObj.host.tooltipService.show({
      dataItems: plotPoints[indexNearestValue].tooltip,
      identities: [plotPoints[indexNearestValue].identity],
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
