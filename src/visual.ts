"use strict";

import type powerbi from "powerbi-visuals-api";
type EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
type VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as d3 from "./D3 Plotting Functions/D3 Modules";
import { drawXAxis, drawYAxis, drawTooltipLine, drawLines,
          drawDots, drawIcons, addContextMenu,
          drawErrors, initialiseSVG, drawSummaryTable, drawDownloadButton } from "./D3 Plotting Functions"
import { defaultSettingsKeys, viewModelClass, type plotData, type viewModelValidationT } from "./Classes"
import type { plotDataGrouped } from "./Classes/viewModelClass";
import { identitySelected } from "./Functions";

export type svgBaseType = d3.Selection<SVGSVGElement, unknown, null, undefined>;
export type divBaseType = d3.Selection<HTMLDivElement, unknown, null, undefined>;

export class Visual implements powerbi.extensibility.IVisual {
  host: powerbi.extensibility.visual.IVisualHost;
  tableDiv: divBaseType;
  svg: svgBaseType;
  viewModel: viewModelClass;
  selectionManager: powerbi.extensibility.ISelectionManager;

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
    this.tableDiv = d3.select(options.element).append("div")
                                              .style("overflow", "auto");

    this.svg = d3.select(options.element).append("svg");
    this.host = options.host;
    this.viewModel = new viewModelClass();

    this.selectionManager = this.host.createSelectionManager();
    this.selectionManager.registerOnSelectCallback(() => this.updateHighlighting());

    this.svg.call(initialiseSVG);
    const table = this.tableDiv.append("table")
                                .classed("table-group", true)
                                .style("border-collapse", "collapse")
                                .style("width", "100%")
                                .style("height", "100%");

    table.append("thead").append("tr").classed("table-header", true);
    table.append('tbody').classed("table-body", true);
  }

  public update(options: VisualUpdateOptions): void {
    try {
      this.host.eventService.renderingStarted(options);
      // Remove printed error if refreshing after a previous error run
      this.svg.select(".errormessage").remove();

      // This step handles the updating of both the input data and settings
      // If there are any errors or failures, the update exits early sets the
      // update status to false
      const update_status: viewModelValidationT = this.viewModel.update(options, this.host);
      console.log(this.viewModel)

      if (!update_status.status) {
        this.resizeCanvas(options.viewport.width, options.viewport.height);
        if (this.viewModel?.inputSettings?.settings?.canvas?.show_errors ?? true) {
          this.svg.call(drawErrors, options, update_status?.error, update_status?.type);
        } else {
          this.svg.call(initialiseSVG, true);
        }

        this.host.eventService.renderingFailed(options);
        return;
      }

      if (update_status.warning) {
        this.host.displayWarningIcon("Invalid inputs or settings ignored.\n",
                                      update_status.warning);
      }

      if (this.viewModel.showGrouped || this.viewModel.inputSettings.settings.summary_table.show_table) {
        this.resizeCanvas(0, 0);
        this.tableDiv.call(drawSummaryTable, this)
                     .call(addContextMenu, this);
      } else {
        this.resizeCanvas(options.viewport.width, options.viewport.height);
        this.svg.call(drawXAxis, this)
                .call(drawYAxis, this)
                .call(drawTooltipLine, this)
                .call(drawLines, this)
                .call(drawDots, this)
                .call(drawIcons, this)
                .call(addContextMenu, this)
                .call(drawDownloadButton, this)
      }
      this.updateHighlighting();
      this.host.eventService.renderingFinished(options);
    } catch (caught_error) {
      this.resizeCanvas(options.viewport.width, options.viewport.height);
      this.svg.call(drawErrors, options, caught_error.message, "internal");
      console.error(caught_error)
      this.host.eventService.renderingFailed(options);
    }
  }

  resizeCanvas(width: number, height: number): void {
    this.svg.attr("width", width).attr("height", height);
    if (width === 0 && height === 0) {
      this.tableDiv.style("width", "100%").style("height", "100%");
    } else {
      this.tableDiv.style("width", "0%").style("height", "0%");
    }
  }

  updateHighlighting(): void {
    const anyHighlights: boolean = this.viewModel.inputData ? this.viewModel.inputData.anyHighlights : false;
    const anyHighlightsGrouped: boolean = this.viewModel.inputDataGrouped ? this.viewModel.inputDataGrouped.some(d => d.anyHighlights) : false;
    const allSelectionIDs: ISelectionId[] = this.selectionManager.getSelectionIds() as ISelectionId[];
    const opacityFull: number = this.viewModel.inputSettings.settings.scatter.opacity;
    const opacityReduced: number = this.viewModel.inputSettings.settings.scatter.opacity_unselected;

    const defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                      ? opacityReduced
                                      : opacityFull;
    this.svg.selectAll(".linesgroup").style("stroke-opacity", defaultOpacity);

    const dotsSelection = this.svg.selectAll(".dotsgroup").selectChildren();
    const tableSelection = this.tableDiv.selectAll(".table-body").selectChildren();

    dotsSelection.style("fill-opacity", defaultOpacity);
    tableSelection.style("opacity", defaultOpacity);
    if (anyHighlights || (allSelectionIDs.length > 0) || anyHighlightsGrouped) {
      dotsSelection.nodes().forEach(currentDotNode => {
        const dot: plotData = d3.select(currentDotNode).datum() as plotData;
        const currentPointSelected: boolean = identitySelected(dot.identity, this.selectionManager);
        const currentPointHighlighted: boolean = dot.highlighted;
        const newDotOpacity: number = (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
        d3.select(currentDotNode).style("fill-opacity", newDotOpacity);
      })

      tableSelection.nodes().forEach(currentTableNode => {
        const dot: plotDataGrouped = d3.select(currentTableNode).datum() as plotDataGrouped;
        const currentPointSelected: boolean = identitySelected(dot.identity, this.selectionManager);
        const currentPointHighlighted: boolean = dot.highlighted;
        const newTableOpacity: number = (currentPointSelected || currentPointHighlighted) ? dot.aesthetics["table_opacity"] : dot.aesthetics["table_opacity_unselected"];
        d3.select(currentTableNode).style("opacity", newTableOpacity);
      })
    }
  }

  // Function to render the properties specified in capabilities.json to the properties pane
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumerationObject {
    return this.viewModel.inputSettings.createSettingsEntry(options.objectName as defaultSettingsKeys);
  }
}
