import * as d3 from "./D3 Modules";
import type { plotData } from "../Classes";
import type { svgBaseType, Visual } from "../visual";

export default function addContextMenu(selection: svgBaseType, visualObj: Visual) {
  if (!(visualObj.viewModel.plotProperties.displayPlot)) {
    selection.on("contextmenu", () => { return; });
    return;
  }
  selection.on('contextmenu', (event) => {
    const eventTarget: d3.BaseType = event.target as d3.BaseType;
    const dataPoint: plotData = <plotData>(d3.select(eventTarget).datum());
    visualObj.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
      x: event.clientX,
      y: event.clientY
    });
    event.preventDefault();
  });
}
