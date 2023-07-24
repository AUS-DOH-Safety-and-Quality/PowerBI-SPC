"use strict";

import powerbi from "powerbi-visuals-api";
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as d3 from "d3";
import * as spc from "./D3 Plotting Functions"
import viewModelClass from "./Classes/viewModelClass"

export type svgBaseType = d3.Selection<SVGSVGElement, unknown, null, undefined>;

export class Visual implements powerbi.extensibility.IVisual {
  host: powerbi.extensibility.visual.IVisualHost;
  svg: svgBaseType;
  viewModel: viewModelClass;
  selectionManager: powerbi.extensibility.ISelectionManager;
  // Service for notifying external clients (export to powerpoint/pdf) of rendering status
  events: powerbi.extensibility.IVisualEventService;

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
    this.svg = d3.select(options.element).append("svg");
    this.events = options.host.eventService;
    this.host = options.host;
    this.viewModel = new viewModelClass();

    this.selectionManager = this.host.createSelectionManager();
    this.selectionManager.registerOnSelectCallback(() => {
      this.svg.call(spc.updateHighlighting, this);
    });

    this.svg.append('g').classed("dotsgroup", true)
    this.svg.append('g').classed("linesgroup", true)
    this.svg.append('line').classed("ttip-line-x", true)
    this.svg.append('line').classed("ttip-line-y", true)
    this.svg.append('g').classed("xaxisgroup", true)
    this.svg.append('text').classed("xaxislabel", true)
    this.svg.append('g').classed("yaxisgroup", true)
    this.svg.append('text').classed("yaxislabel", true)
  }

  public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
    try {
      this.events.renderingStarted(options);

      this.viewModel.update({ options: options, host: this.host });
      this.svg.attr("width", this.viewModel.plotProperties.width)
              .attr("height", this.viewModel.plotProperties.height)
              .call(spc.drawXAxis, this)
              .call(spc.drawYAxis, this)
              .call(spc.drawTooltipLine, this)
              .call(spc.drawLines, this)
              .call(spc.drawDots, this)
              .call(spc.drawIcons, this)
              .call(spc.updateHighlighting, this)
              .call(spc.addContextMenu, this)

      this.events.renderingFinished(options);
    } catch (caught_error) {
      console.error(caught_error)
      this.events.renderingFailed(options);
    }
  }

  // Function to render the properties specified in capabilities.json to the properties pane
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumerationObject {
    return this.viewModel.inputSettings.createSettingsEntry(options.objectName);
  }
}
