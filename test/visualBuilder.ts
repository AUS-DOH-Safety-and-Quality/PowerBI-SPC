import { VisualBuilderBase } from "powerbi-visuals-utils-testutils";

import { Visual as VisualClass } from "../src/visual";

import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

export class ChartBuilder extends VisualBuilderBase<VisualClass> {
  constructor(width: number, height: number) {
    super(width, height);
  }

  protected build(options: VisualConstructorOptions) {
    return new VisualClass(options);
  }

  public get mainElement(): SVGElement | null {
    return this.element.querySelector("svg.chart");
  }
}
