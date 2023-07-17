import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import viewModelClass from "./viewModelClass";
import { plotData } from "./viewModelClass";
import drawDots from "../D3 Plotting Functions/drawDots";
import ISelectionId = powerbi.visuals.ISelectionId;
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgDotsClass {
  dotsGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.dotsGroup.call(drawDots, viewModel);
  }

  highlight(anyHighlights: boolean, allSelectionIDs: ISelectionId[],
            opacityFull: number, opacityReduced: number): void {
    const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                      ? opacityReduced
                                      : opacityFull;
    this.dotsGroup.selectAll(".dotsgroup").selectChildren().style("fill-opacity", defaultOpacity);
    if (anyHighlights || (allSelectionIDs.length > 0)) {
      this.dotsGroup.selectAll(".dotsgroup").selectChildren().style("fill-opacity", (dot: plotData) => {
        const currentPointSelected: boolean = allSelectionIDs.some((currentSelectionId: ISelectionId) => {
          return currentSelectionId.includes(dot.identity);
        });
        const currentPointHighlighted: boolean = dot.highlighted;
        return (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
      })
    }
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.dotsGroup = svg.append("g");
  }
}
export default svgDotsClass
