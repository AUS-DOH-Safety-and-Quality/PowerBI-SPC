import type powerbi from "powerbi-visuals-api";
import type { plotData, plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, svgBaseType, Visual } from "../visual";
import { bindContextMenu, select, type BaseType } from "powerbi-visuals-core/rendering";

type ISelectionId = powerbi.visuals.ISelectionId;

export default function addContextMenu(selection: svgBaseType | divBaseType, visualObj: Visual) {
  const root = selection.node();
  if (root === null) return;
  bindContextMenu(root, {
    enabled: visualObj.plotProperties.displayPlot
      || visualObj.viewModel.inputSettings.settings[0].summary_table.show_table
      || visualObj.viewModel.showGrouped,
    // showContextMenu takes one ISelectionId, so grouped rows supply their first; background keeps the empty identity
    identity: target => {
      const dataPoint = select(target as BaseType).datum() as plotData | plotDataGrouped | undefined;
      if (dataPoint === undefined) return {} as ISelectionId;
      return Array.isArray(dataPoint.identity) ? dataPoint.identity[0] : dataPoint.identity;
    },
    show: (identity, position) => visualObj.selectionManager.showContextMenu(identity, position)
  });
}
