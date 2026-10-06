import type { svgBaseType, Visual } from "../visual";
import type { plotData } from "../Classes/viewModelClass";
import type plotPropertiesClass from "../Classes/plotPropertiesClass";
import { isNullOrUndefined } from "powerbi-visuals-core/data";
import { drawCrosshairs } from "powerbi-visuals-core/rendering";

export default function drawTooltipLine(selection: svgBaseType, visualObj: Visual) {
  const plotProperties: plotPropertiesClass = visualObj.plotProperties;
  const vertical = selection.select<SVGLineElement>(".ttip-line-x").node();
  const horizontal = selection.select<SVGLineElement>(".ttip-line-y").node();
  if (vertical === null || horizontal === null) return;
  const crosshairs = drawCrosshairs({
    vertical, horizontal,
    left: plotProperties.xAxis.start_padding,
    right: visualObj.viewModel.svgWidth - plotProperties.xAxis.end_padding,
    top: plotProperties.yAxis.end_padding,
    bottom: visualObj.viewModel.svgHeight - plotProperties.yAxis.start_padding,
    colour: visualObj.viewModel.colourPalette.isHighContrast
      ? visualObj.viewModel.colourPalette.foregroundColour
      : "black"
  });

  selection.on("mousemove", (event) => {
    if (!plotProperties.displayPlot) {
      return;
    }
    const plotPoints: plotData[] = visualObj.viewModel.plotPoints[0] as plotData[]

    const boundRect = (visualObj.svg.node() as SVGSVGElement).getBoundingClientRect();
    const xValue: number = (event.clientX - boundRect.left);
    let indexNearestValue: number | undefined;
    let nearestDistance: number = Infinity;
    let x_coord: number | undefined;
    let y_coord: number | undefined;
    for (let i = 0; i < plotPoints.length; i++) {
      const curr_x: number = plotProperties.xScale(plotPoints[i].x) as number;
      const curr_diff: number = Math.abs(curr_x - xValue);
      if (curr_diff < nearestDistance) {
        nearestDistance = curr_diff;
        indexNearestValue = i;
        x_coord = curr_x;
        y_coord = plotProperties.yScale(plotPoints[i].value);
      }
    }

    if (isNullOrUndefined(indexNearestValue) || isNullOrUndefined(x_coord) || isNullOrUndefined(y_coord)) {
      return;
    }

    visualObj.host.tooltipService.show({
      dataItems: plotPoints[indexNearestValue].tooltip,
      identities: [plotPoints[indexNearestValue].identity],
      coordinates: [x_coord, y_coord],
      isTouchEvent: false
    });
    crosshairs.show(x_coord, y_coord);
  })
  .on("mouseleave", () => {
    if (!plotProperties.displayPlot) {
      return;
    }
    visualObj.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
    crosshairs.hide();
  });
}
