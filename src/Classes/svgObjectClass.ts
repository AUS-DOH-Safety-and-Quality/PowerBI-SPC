import * as d3 from "d3";
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;


class svgObjectClass {
  listeningRect: SelectionBase;
  tooltipLineGroup: SelectionBase;
  dotGroup: SelectionBase;
  lineGroup: SelectionBase;
  xAxisGroup: d3.Selection<SVGGElement, any, any, any>;
  xAxisLabels: d3.Selection<SVGTextElement, unknown, null, undefined>;
  yAxisGroup: d3.Selection<SVGGElement, any, any, any>;
  yAxisLabels: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.tooltipLineGroup = svg.append("g");
    this.listeningRect = svg.append("g");
    this.lineGroup = svg.append("g");
    this.dotGroup = svg.append("g");
    this.xAxisGroup = svg.append("g");
    this.yAxisGroup = svg.append("g");

    this.xAxisLabels = svg.append("text");
    this.yAxisLabels = svg.append("text");

  }
}

export default svgObjectClass
