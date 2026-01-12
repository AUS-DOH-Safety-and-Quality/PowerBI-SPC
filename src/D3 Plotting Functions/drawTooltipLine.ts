import type { svgBaseType, Visual } from "../visual";
import type { plotData } from "../Classes/viewModelClass";
import type plotPropertiesClass from "../Classes/plotPropertiesClass";

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
    const plotPoints: plotData[] = visualObj.viewModel.plotPoints[0] as plotData[]

    const boundRect = visualObj.svg.node().getBoundingClientRect();
    const xValue: number = (event.pageX - boundRect.left);
    let indexNearestValue: number;
    let nearestDistance: number = Infinity;
    let x_coord: number;
    let y_coord: number;
    for (let i = 0; i < plotPoints.length; i++) {
      const curr_x: number = plotProperties.xScale(plotPoints[i].x);
      const curr_diff: number = Math.abs(curr_x - xValue);
      if (curr_diff < nearestDistance) {
        nearestDistance = curr_diff;
        indexNearestValue = i;
        x_coord = curr_x;
        y_coord = plotProperties.yScale(plotPoints[i].value);
      }
    }

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
