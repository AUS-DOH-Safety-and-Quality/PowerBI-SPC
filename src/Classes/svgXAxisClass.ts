import * as d3 from "d3";
import viewModelClass from "./viewModelClass";
import drawXAxis from "../D3 Plotting Functions/drawXAxis";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgXAxisClass {
  xAxisGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.xAxisGroup.call(drawXAxis, viewModel);
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.xAxisGroup = svg.append("g");
  }
}
export default svgXAxisClass
