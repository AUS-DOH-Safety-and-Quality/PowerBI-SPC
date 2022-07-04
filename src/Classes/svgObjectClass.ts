import * as d3 from "d3";


class svgObjectClass {
  listeningRect: d3.Selection<SVGElement, any, any, any>;
  tooltipLineGroup: d3.Selection<SVGElement, any, any, any>;
  dotGroup: d3.Selection<SVGElement, any, any, any>;
  lineGroup: d3.Selection<SVGElement, any, any, any>;
  xAxisGroup: d3.Selection<SVGGElement, any, any, any>;
  xAxisLabels: d3.Selection<SVGGElement, any, any, any>;
  yAxisGroup: d3.Selection<SVGGElement, any, any, any>;
  yAxisLabels: d3.Selection<SVGGElement, any, any, any>;

  constructor(svg: d3.Selection<SVGElement, any, any, any>) {
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
