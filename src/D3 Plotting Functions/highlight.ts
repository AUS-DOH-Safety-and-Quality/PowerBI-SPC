import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import viewModelClass from "../Classes/viewModelClass";
import { plotData } from "../Classes/viewModelClass";
import ISelectionId = powerbi.visuals.ISelectionId;
import ExtensISelectionId = powerbi.extensibility.ISelectionId;

type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

export default function highlight(selection: SelectionBase, viewModel: viewModelClass, allSelectionIDs: ExtensISelectionId[]) {
  const anyHighlights: boolean = viewModel.inputData ? viewModel.inputData.anyHighlights : false;

  const opacityFull: number = viewModel.inputSettings.scatter.opacity;
  const opacityReduced: number = viewModel.inputSettings.scatter.opacity_unselected;

  const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                    ? opacityReduced
                                    : opacityFull;
  selection.selectAll(".dotsgroup").selectChildren().style("fill-opacity", defaultOpacity);
  selection.selectAll(".linesgroup").style("stroke-opacity", defaultOpacity);
  if (anyHighlights || (allSelectionIDs.length > 0)) {
    selection.selectAll(".dotsgroup").selectChildren().style("fill-opacity", (dot: plotData) => {
      const currentPointSelected: boolean = (allSelectionIDs as ISelectionId[]).some((currentSelectionId: ISelectionId) => {
        return currentSelectionId.includes(dot.identity);
      });
      const currentPointHighlighted: boolean = dot.highlighted;
      return (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
    })
  }
}
