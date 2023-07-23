"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import viewModelClass from "./Classes/viewModelClass"
import * as d3 from "d3";
import updateHighlighting from "./D3 Plotting Functions/updateHighlighting";
import drawXAxis from "./D3 Plotting Functions/drawXAxis";
import drawYAxis from "./D3 Plotting Functions/drawYAxis";
import drawTooltipLine from "./D3 Plotting Functions/drawTooltipLine";
import drawLines from "./D3 Plotting Functions/drawLines";
import drawDots from "./D3 Plotting Functions/drawDots";
import drawIcons from "./D3 Plotting Functions/drawIcons";
import addContextMenu from "./D3 Plotting Functions/addContextMenu";

export type svgBaseType = d3.Selection<SVGSVGElement, unknown, null, undefined>;

export class Visual implements IVisual {
  host: IVisualHost;
  svg: svgBaseType;
  viewModel: viewModelClass;
  selectionManager: ISelectionManager;
  // Service for notifying external clients (export to powerpoint/pdf) of rendering status
  events: IVisualEventService;

  constructor(options: VisualConstructorOptions) {
    console.log("Constructor start")
    console.log(options)

    this.svg = d3.select(options.element).append("svg");
    this.events = options.host.eventService;
    this.host = options.host;
    this.viewModel = new viewModelClass();

    this.selectionManager = this.host.createSelectionManager();
    this.selectionManager.registerOnSelectCallback(() => {
      this.svg.call(updateHighlighting, this);
    });

    this.svg.append('g').classed("dotsgroup", true)
    this.svg.append('g').classed("linesgroup", true)
    this.svg.append('g').classed("ttip-line", true)
    this.svg.append('g').classed("xaxisgroup", true)
    this.svg.append('text').classed("xaxislabel", true)
    this.svg.append('g').classed("yaxisgroup", true)
    this.svg.append('text').classed("yaxislabel", true)

    console.log("Constructor finish")
  }

  public update(options: VisualUpdateOptions) {
    console.log("Update start")
    try {
      this.events.renderingStarted(options);
      console.log(options)

      console.log("viewModel start")
      this.viewModel.update({ options: options, host: this.host });

      console.log("Draw plot")
      this.svg.attr("width", this.viewModel.plotProperties.width)
              .attr("height", this.viewModel.plotProperties.height)
              .call(drawXAxis, this)
              .call(drawYAxis, this)
              .call(drawTooltipLine, this)
              .call(drawLines, this)
              .call(drawDots, this)
              .call(drawIcons, this)
              .call(updateHighlighting, this)
              .call(addContextMenu, this)

      console.log("Update finished")
      console.log(this.viewModel)

      console.log(this.svg)
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
