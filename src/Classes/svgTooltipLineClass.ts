import * as d3 from "d3";
import viewModelClass from "./viewModelClass";
import drawTooltipLine from "../D3 Plotting Functions/drawTooltipLine";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgTooltipLineClass {
  tooltipLineGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.tooltipLineGroup.call(drawTooltipLine, viewModel)
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.tooltipLineGroup = svg.append("g");
  }
}
export default svgTooltipLineClass
