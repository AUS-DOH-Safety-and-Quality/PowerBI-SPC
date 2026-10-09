import type { plotData } from "../Classes/viewModelClass";
import type { svgBaseType, Visual } from "../visual";
import { drawDots } from "powerbi-visuals-core/rendering";

// Toggles a limit split at the point; persisting it triggers the update that recalculates the limits
function toggleSplit(visualObj: Visual, point: plotData): void {
  const splitIndexes = visualObj.viewModel.splitIndexes;
  const xIndex = splitIndexes.indexOf(point.x);
  if (xIndex > -1) {
    splitIndexes.splice(xIndex, 1);
  } else {
    splitIndexes.push(point.x);
  }
  visualObj.host.persistProperties({
    replace: [{
      objectName: "split_indexes_storage",
      selector: {},
      properties: { split_indexes: JSON.stringify(splitIndexes) }
    }]
  });
}

export default function drawPlotDots(selection: svgBaseType, visualObj: Visual) {
  const svg = selection.node();
  if (svg === null) {
    return;
  }
  const viewModel = visualObj.viewModel;
  const settings = viewModel.inputSettings.settings[0];
  drawDots(svg, {
    frame: visualObj.plotProperties,
    points: viewModel.plotPoints[0] as plotData[],
    show: settings.scatter.show_dots,
    text: undefined,
    host: visualObj.host,
    selectionManager: visualObj.selectionManager,
    onSelectionChange: () => visualObj.updateHighlighting(),
    onClick: settings.spc.split_on_click ? point => toggleSplit(visualObj, point) : undefined
  });
}
