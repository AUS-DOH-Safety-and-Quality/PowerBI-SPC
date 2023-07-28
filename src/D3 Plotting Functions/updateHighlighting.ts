import powerbi from "powerbi-visuals-api";
import * as d3 from "./D3 Modules"
import { plotData } from "../Classes/viewModelClass";
import ISelectionId = powerbi.visuals.ISelectionId;
import { svgBaseType, Visual } from "../visual";

type dotSelection = d3.Selection<SVGCircleElement, plotData, d3.BaseType, unknown>

export default function updateHighlighting(selection: svgBaseType, visualObj: Visual) {
  const anyHighlights: boolean = visualObj.viewModel.inputData ? visualObj.viewModel.inputData.anyHighlights : false;
  const allSelectionIDs: ISelectionId[] = visualObj.selectionManager.getSelectionIds() as ISelectionId[];

  const opacityFull: number = visualObj.viewModel.inputSettings.scatter.opacity;
  const opacityReduced: number = visualObj.viewModel.inputSettings.scatter.opacity_unselected;

  const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                    ? opacityReduced
                                    : opacityFull;
  selection.selectAll(".dotsgroup").selectChildren().style("fill-opacity", defaultOpacity);
  selection.selectAll(".linesgroup").style("stroke-opacity", defaultOpacity);
  if (anyHighlights || (allSelectionIDs.length > 0)) {
    const dotSelection: dotSelection = selection.selectAll(".dotsgroup").selectChildren();
    dotSelection.style("fill-opacity", (dot: any) => {
      const currentPointSelected: boolean = allSelectionIDs.some((currentSelectionId: ISelectionId) => {
        return currentSelectionId.includes(dot.identity);
      });
      const currentPointHighlighted: boolean = dot.highlighted;
      return (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
    })
  }
}
