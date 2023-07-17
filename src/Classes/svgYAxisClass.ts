import * as d3 from "d3";
import viewModelClass from "./viewModelClass";
import drawYAxis from "../D3 Plotting Functions/drawYAxis";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgYAxisClass {
  yAxisGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.yAxisGroup.call(drawYAxis, viewModel)
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.yAxisGroup = svg.append("g");
  }
}
export default svgYAxisClass
