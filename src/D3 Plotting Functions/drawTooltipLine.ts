import type { svgBaseType, Visual } from "../visual";
import type { plotData } from "../Classes/viewModelClass";
import { drawCrosshairs, screenToSvg, nearestPoint } from "powerbi-visuals-core/rendering";

export default function drawTooltipLine(selection: svgBaseType, visualObj: Visual) {
  const plotProperties = visualObj.plotProperties;
  const vertical = selection.select<SVGLineElement>(".ttip-line-x").node();
  const horizontal = selection.select<SVGLineElement>(".ttip-line-y").node();
  if (vertical === null || horizontal === null) {
    return;
  }
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
    const plotPoints = visualObj.viewModel.plotPoints[0] as plotData[];
    const node = visualObj.svg.node();
    if (node === null) {
      return;
    }
    const pointer = screenToSvg(node, event.clientX, event.clientY);
    const nearest = nearestPoint(plotPoints.length,
      i => ({ x: plotProperties.xScale(plotPoints[i].x), y: plotProperties.yScale(plotPoints[i].value) }), pointer.x, pointer.y, false);
    if (nearest === undefined) {
      return;
    }
    visualObj.host.tooltipService.show({
      dataItems: plotPoints[nearest.index].tooltip,
      identities: [plotPoints[nearest.index].identity],
      coordinates: [nearest.x, nearest.y],
      isTouchEvent: false
    });
    crosshairs.show(nearest.x, nearest.y);
  })
  .on("mouseleave", () => {
    if (!plotProperties.displayPlot) {
      return;
    }
    visualObj.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
    crosshairs.hide();
  });
}
