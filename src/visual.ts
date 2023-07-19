"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import viewModelClass from "./Classes/viewModelClass"
import { plotData } from "./Classes/viewModelClass";
import * as d3 from "d3";
import highlight from "./D3 Plotting Functions/highlight";
import drawXAxis from "./D3 Plotting Functions/drawXAxis";
import drawYAxis from "./D3 Plotting Functions/drawYAxis";
import drawTooltipLine from "./D3 Plotting Functions/drawTooltipLine";
import drawLines from "./D3 Plotting Functions/drawLines";
import drawDots from "./D3 Plotting Functions/drawDots";
import drawIcons from "./D3 Plotting Functions/drawIcons";

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
    this.selectionManager.registerOnSelectCallback(() => this.updateHighlighting());

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
              .call(drawXAxis, this.viewModel)
              .call(drawYAxis, this.viewModel)
              .call(drawTooltipLine, this.viewModel, this.host.tooltipService)
              .call(drawLines, this.viewModel)
              .call(drawDots, this)
              .call(drawIcons, this.viewModel)

      if (this.viewModel.plotProperties.displayPlot) {
        this.addContextMenu()
        this.updateHighlighting()
      }

      this.events.renderingFinished(options);
      console.log("Update finished")
      console.log(this.viewModel)
    } catch (caught_error) {
      console.error(caught_error)
      this.events.renderingFailed(options);
    }
  }

  // Function to render the properties specified in capabilities.json to the properties pane
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
    return this.viewModel.inputSettings.createSettingsEntry(options.objectName);
  }

  addContextMenu(): void {
    this.svg.on('contextmenu', (event) => {
      const eventTarget: EventTarget = event.target;
      const dataPoint: plotData = <plotData>(d3.select(<d3.BaseType>eventTarget).datum());
      this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
        x: event.clientX,
        y: event.clientY
      });
      event.preventDefault();
    });
  }

  updateHighlighting() {
    this.svg.call(highlight, this.viewModel, this.selectionManager.getSelectionIds())
  }
}
