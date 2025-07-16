"use strict";

import type powerbi from "powerbi-visuals-api";
type EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
type VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as d3 from "./D3 Plotting Functions/D3 Modules";
import { drawXAxis, drawYAxis, drawTooltipLine, drawLines,
          drawDots, drawIcons, addContextMenu,
          drawErrors, initialiseSVG, drawSummaryTable, drawDownloadButton,
          drawValueLabels, drawLineLabels } from "./D3 Plotting Functions"
import { defaultSettingsKeys, viewModelClass, type plotData, type viewModelValidationT } from "./Classes"
import type { lineData, plotDataGrouped } from "./Classes/viewModelClass";
import { getAesthetic, identitySelected } from "./Functions";

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
      // If running headless just return without attempting to render
      if (options?.["headless"]) {
        return;
      }
      if (!update_status.status) {
        this.resizeCanvas(options.viewport.width, options.viewport.height);
        if (this.viewModel?.inputSettings?.settings?.canvas?.show_errors ?? true) {
          this.svg.call(drawErrors, options, this.viewModel.colourPalette, update_status?.error, update_status?.type);
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
        this.drawVisual();
        this.adjustPaddingForOverflow();
      }

      this.updateHighlighting();
      this.host.eventService.renderingFinished(options);
    } catch (caught_error) {
      this.resizeCanvas(options.viewport.width, options.viewport.height);
      this.svg.call(drawErrors, options, this.viewModel.colourPalette, caught_error.message, "internal");
      console.error(caught_error)
      this.host.eventService.renderingFailed(options);
    }
  }

  drawVisual(): void {
    this.svg.call(drawXAxis, this)
            .call(drawYAxis, this)
            .call(drawTooltipLine, this)
            .call(drawLines, this)
            .call(drawLineLabels, this)
            .call(drawDots, this)
            .call(drawIcons, this)
            .call(addContextMenu, this)
            .call(drawDownloadButton, this)
            .call(drawValueLabels, this);
  }

  adjustPaddingForOverflow(): void {
    let xLeftOverflow: number = 0;
    let xRightOverflow: number = 0;
    let yBottomOverflow: number = 0;
    let yTopOverflow: number = 0;
    const svgWidth: number = this.viewModel.svgWidth;
    const svgHeight: number = this.viewModel.svgHeight;
    this.svg.selectChildren().each(function() {
      const currentClass: string = d3.select(this).attr("class");
      if (currentClass === "yaxislabel" || currentClass === "xaxislabel") {
        return;
      }
      const boundRect = (this as SVGGraphicsElement).getBoundingClientRect();
      const bbox = (this as SVGGraphicsElement).getBBox();
      xLeftOverflow = Math.min(xLeftOverflow, bbox.x);
      xRightOverflow = Math.max(xRightOverflow, boundRect.right - svgWidth);
      yBottomOverflow = Math.max(yBottomOverflow, boundRect.bottom - svgHeight);
      yTopOverflow = Math.min(yTopOverflow, boundRect.top);
    });

    xLeftOverflow = Math.abs(xLeftOverflow);
    xRightOverflow = Math.abs(xRightOverflow);
    yBottomOverflow = Math.abs(yBottomOverflow);
    yTopOverflow = Math.abs(yTopOverflow);

    // Only redraw plot if overflow occurred
    if ((xLeftOverflow + xRightOverflow + yBottomOverflow + yTopOverflow) > 0) {
      this.viewModel.plotProperties.xAxis.start_padding += xLeftOverflow + this.viewModel.plotProperties.xAxis.start_padding;
      this.viewModel.plotProperties.xAxis.end_padding += xRightOverflow + this.viewModel.plotProperties.xAxis.end_padding;
      this.viewModel.plotProperties.yAxis.start_padding += yBottomOverflow + this.viewModel.plotProperties.yAxis.start_padding;
      this.viewModel.plotProperties.yAxis.end_padding += yTopOverflow + this.viewModel.plotProperties.yAxis.end_padding;
      this.viewModel.plotProperties.initialiseScale(svgWidth, svgHeight);
      this.drawVisual();
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

    const dotsSelection = this.svg.selectAll(".dotsgroup").selectChildren();
    const linesSelection = this.svg.selectAll(".linesgroup").selectChildren();
    const tableSelection = this.tableDiv.selectAll(".table-body").selectChildren();

    // Set all elements to their default opacity before applying highlights
    linesSelection.style("stroke-opacity", (d: [string, lineData[]]) => {
      return getAesthetic(d[0], "lines", "opacity", this.viewModel.inputSettings.settings)
    });
    dotsSelection.style("fill-opacity", (d: plotData) => d.aesthetics.opacity);
    tableSelection.style("opacity", (d: plotData) => d.aesthetics["table_opacity"]);

    if (anyHighlights || (allSelectionIDs.length > 0) || anyHighlightsGrouped) {
      linesSelection.style("stroke-opacity", (d: [string, lineData[]]) => {
        return getAesthetic(d[0], "lines", "opacity_unselected", this.viewModel.inputSettings.settings)
      });
      dotsSelection.nodes().forEach(currentDotNode => {
        const dot: plotData = d3.select(currentDotNode).datum() as plotData;
        const currentPointSelected: boolean = identitySelected(dot.identity, this.selectionManager);
        const currentPointHighlighted: boolean = dot.highlighted;
        const newDotOpacity: number = (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity_selected  : dot.aesthetics.opacity_unselected;
        d3.select(currentDotNode).style("fill-opacity", newDotOpacity);
      })

      tableSelection.nodes().forEach(currentTableNode => {
        const dot: plotDataGrouped = d3.select(currentTableNode).datum() as plotDataGrouped;
        const currentPointSelected: boolean = identitySelected(dot.identity, this.selectionManager);
        const currentPointHighlighted: boolean = dot.highlighted;
        const newTableOpacity: number = (currentPointSelected || currentPointHighlighted) ? dot.aesthetics["table_opacity_selected"] : dot.aesthetics["table_opacity_unselected"];
        d3.select(currentTableNode).style("opacity", newTableOpacity);
      })
    }
  }

  // Function to render the properties specified in capabilities.json to the properties pane
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumerationObject {
    return this.viewModel.inputSettings.createSettingsEntry(options.objectName as defaultSettingsKeys);
  }
}
