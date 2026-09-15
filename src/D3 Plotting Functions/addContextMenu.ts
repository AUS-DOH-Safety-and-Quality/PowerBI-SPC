import * as d3 from "./D3 Modules";
import type powerbi from "powerbi-visuals-api";
import type { plotData, plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, svgBaseType, Visual } from "../visual";

type ISelectionId = powerbi.visuals.ISelectionId;

export default function addContextMenu(selection: svgBaseType | divBaseType, visualObj: Visual) {
  if (!(visualObj.plotProperties.displayPlot
        || visualObj.viewModel.inputSettings.settings[0].summary_table.show_table
        || visualObj.viewModel.showGrouped)) {
    selection.on("contextmenu", () => { return; });
    return;
  }
  selection.on('contextmenu', (event) => {
    const eventTarget: d3.BaseType = event.target as d3.BaseType;
    const dataPoint: plotData | plotDataGrouped = d3.select(eventTarget).datum() as plotData | plotDataGrouped;
    // showContextMenu only accepts a single ISelectionId, so use the first if grouped
    const identity: ISelectionId | {} = !dataPoint
      ? {}
      : (Array.isArray(dataPoint.identity) ? dataPoint.identity[0] : dataPoint.identity);
    visualObj.selectionManager.showContextMenu(identity as ISelectionId, {
      x: event.clientX,
      y: event.clientY
    });
    event.preventDefault();
  });
}
