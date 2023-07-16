import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import extensibility = powerbi.extensibility;
import ex_visual = extensibility.visual;
import VisualConstructorOptions = ex_visual.VisualConstructorOptions;
import svgDotsClass from "./svgDotsClass";
import svgIconClass from "./svgIconClass";
import svgLinesClass from "./svgLinesClass";
import svgTooltipLineClass from "./svgTooltipLineClass";
import svgXAxisClass from "./svgXAxisClass";
import svgYAxisClass from "./svgYAxisClass";
import viewModelClass from "./viewModelClass";

interface svgTypes {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  svgTooltipLine: svgTooltipLineClass,
  svgXAxis: svgXAxisClass,
  svgYAxis: svgYAxisClass,
  svgDots: svgDotsClass,
  svgLines: svgLinesClass,
  svgIcons: svgIconClass,
  draw: (viewModel: viewModelClass) => void
}

type svgKeys = Exclude<keyof svgTypes, "draw" | "svg">;

class plottingClass implements svgTypes {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  svgTooltipLine: svgTooltipLineClass;
  svgXAxis: svgXAxisClass;
  svgYAxis: svgYAxisClass;
  svgDots: svgDotsClass;
  svgLines: svgLinesClass;
  svgIcons: svgIconClass;

  draw(viewModel: viewModelClass): void {
    Object.getOwnPropertyNames(this).filter(d => !(["draw", "svg"].includes(d))).forEach(key => {
      this[key as svgKeys].draw(viewModel);
    })
  }

  constructor(options: VisualConstructorOptions) {
    this.svg = d3.select(options.element).append("svg");
    this.svgTooltipLine = new svgTooltipLineClass(this.svg);
    this.svgXAxis = new svgXAxisClass(this.svg);
    this.svgYAxis = new svgYAxisClass(this.svg);
    this.svgDots = new svgDotsClass(this.svg);
    this.svgLines = new svgLinesClass(this.svg);
    this.svgIcons = new svgIconClass(this.svg);
  }
}

export default plottingClass;
