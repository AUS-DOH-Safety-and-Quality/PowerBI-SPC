import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import viewModelClass from "./viewModelClass";
import drawLines from "../D3 Plotting Functions/drawLines";
import ISelectionId = powerbi.visuals.ISelectionId;
import ExtensISelectionId = powerbi.extensibility.ISelectionId;
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgLinesClass {
  linesGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.linesGroup.call(drawLines, viewModel);
  }

  highlight(anyHighlights: boolean, allSelectionIDs: ExtensISelectionId[],
            opacityFull: number, opacityReduced: number): void {
    const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                      ? opacityReduced
                                      : opacityFull;
    this.linesGroup.style("stroke-opacity", defaultOpacity);
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.linesGroup = svg.append("g");
  }
}
export default svgLinesClass
