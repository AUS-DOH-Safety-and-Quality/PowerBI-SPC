import type powerbi from "powerbi-visuals-api";
import type { plotData } from "../Classes";
type ISelectionId = powerbi.visuals.ISelectionId;
import type { svgBaseType, Visual } from "../visual";

export default function updateHighlighting(selection: svgBaseType, visualObj: Visual) {
  const anyHighlights: boolean = visualObj.viewModel.inputData ? visualObj.viewModel.inputData.anyHighlights : false;
  const allSelectionIDs: ISelectionId[] = visualObj.selectionManager.getSelectionIds() as ISelectionId[];

  const opacityFull: number = visualObj.viewModel.inputSettings.settings.scatter.opacity;
  const opacityReduced: number = visualObj.viewModel.inputSettings.settings.scatter.opacity_unselected;

  const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                    ? opacityReduced
                                    : opacityFull;
  selection.selectAll(".dotsgroup").selectChildren().style("fill-opacity", defaultOpacity);
  selection.selectAll(".linesgroup").style("stroke-opacity", defaultOpacity);
  if (anyHighlights || (allSelectionIDs.length > 0)) {
    selection.selectAll(".dotsgroup").selectChildren().style("fill-opacity", (dot: plotData) => {
      const currentPointSelected: boolean = allSelectionIDs.some((currentSelectionId: ISelectionId) => {
        return currentSelectionId.includes(dot.identity);
      });
      const currentPointHighlighted: boolean = dot.highlighted;
      return (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
    })
  }
}
