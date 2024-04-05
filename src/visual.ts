"use strict";

import type powerbi from "powerbi-visuals-api";
type EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
type VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as d3 from "./D3 Plotting Functions/D3 Modules";
import { drawXAxis, drawYAxis, drawTooltipLine, drawLines,
          drawDots, drawIcons, updateHighlighting, addContextMenu,
          drawErrors, initialiseSVG } from "./D3 Plotting Functions"
import { defaultSettingsKey, viewModelClass } from "./Classes"
import { validateDataView } from "./Functions";

export type svgBaseType = d3.Selection<SVGSVGElement, unknown, null, undefined>;

export class Visual implements powerbi.extensibility.IVisual {
  host: powerbi.extensibility.visual.IVisualHost;
  svg: svgBaseType;
  viewModel: viewModelClass;
  selectionManager: powerbi.extensibility.ISelectionManager;

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
    this.svg = d3.select(options.element).append("svg");
    this.host = options.host;
    this.viewModel = new viewModelClass();

    this.selectionManager = this.host.createSelectionManager();
    this.selectionManager.registerOnSelectCallback(() => {
      this.svg.call(updateHighlighting, this);
    });
    this.svg.call(initialiseSVG);
  }

  public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
    try {
      this.host.eventService.renderingStarted(options);
      // Remove printed error if refreshing after a previous error run
      this.svg.select(".errormessage").remove();
      this.svg.attr("width", options.viewport.width)
              .attr("height", options.viewport.height)

      this.viewModel.inputSettings.update(options.dataViews[0]);
      if (this.viewModel.inputSettings.validationStatus.error !== "") {
        this.svg.call(drawErrors, options, this.viewModel.inputSettings.validationStatus.error, "settings");
        this.host.eventService.renderingFinished(options);
        return;
      }

      const checkDV: string = validateDataView(options.dataViews,
                                               this.viewModel.inputSettings.settings);
      if (checkDV !== "valid") {
        if (this.viewModel.inputSettings.settings.canvas.show_errors) {
          this.svg.call(drawErrors, options, checkDV);
        } else {
          this.svg.call(initialiseSVG, true);
        }
        this.host.eventService.renderingFinished(options);
        return;
      }

      this.viewModel.update(options, this.host);
      if (this.viewModel.inputData.validationStatus.status !== 0) {
        this.svg.call(drawErrors, options, this.viewModel.inputData.validationStatus.error);
        this.host.eventService.renderingFinished(options);
        return;
      }

      this.svg.call(drawXAxis, this)
              .call(drawYAxis, this)
              .call(drawTooltipLine, this)
              .call(drawLines, this)
              .call(drawDots, this)
              .call(drawIcons, this)
              .call(updateHighlighting, this)
              .call(addContextMenu, this)

      if (this.viewModel.inputData.warningMessage !== "") {
        this.host.displayWarningIcon("Invalid inputs or settings ignored.\n",
                                     this.viewModel.inputData.warningMessage);
      }

      this.host.eventService.renderingFinished(options);
    } catch (caught_error) {
      this.svg.call(drawErrors, options, caught_error.message, "internal");
      console.error(caught_error)
      this.host.eventService.renderingFailed(options);
    }
  }

  // Function to render the properties specified in capabilities.json to the properties pane
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumerationObject {
    return this.viewModel.inputSettings.createSettingsEntry(options.objectName as defaultSettingsKey);
  }
}
