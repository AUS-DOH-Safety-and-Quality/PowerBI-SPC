import * as d3 from "d3";
import viewModelClass from "./viewModelClass";
import drawIcons from "../D3 Plotting Functions/drawIcons";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgIconClass {
  iconGroup: SelectionBase;

  draw(viewModel: viewModelClass): void {
    this.iconGroup.call(drawIcons, viewModel)
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.iconGroup = svg.append("g");
  }
}
export default svgIconClass
