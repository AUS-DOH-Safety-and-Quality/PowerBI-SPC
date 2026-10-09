"use strict";

import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as d3 from "./D3 Plotting Functions/D3 Modules";
import drawXAxis from "./D3 Plotting Functions/drawXAxis";
import drawYAxis from "./D3 Plotting Functions/drawYAxis";
import drawTooltipLine from "./D3 Plotting Functions/drawTooltipLine";
import drawLines from "./D3 Plotting Functions/drawLines";
import drawDots from "./D3 Plotting Functions/drawDots";
import drawIcons from "./D3 Plotting Functions/drawIcons";
import addContextMenu from "./D3 Plotting Functions/addContextMenu";
import drawErrors from "./D3 Plotting Functions/drawErrors";
import initialiseSVG from "./D3 Plotting Functions/initialiseSVG";
import drawSummaryTable from "./D3 Plotting Functions/drawSummaryTable";
import drawValueLabels from "./D3 Plotting Functions/drawValueLabels";
import drawLineLabels from "./D3 Plotting Functions/drawLineLabels";
import drawDownloadButton from "./D3 Plotting Functions/drawDownloadButton";
import plotPropertiesClass from "./Classes/plotPropertiesClass";
import viewModelClass, { type plotData, type viewModelValidationT } from "./Classes/viewModelClass";
import type { lineData, plotDataGrouped } from "./Classes/viewModelClass";
import getAesthetic from "./Functions/getAesthetic";
import { identitySelected, selectedKeys } from "powerbi-visuals-core/powerbi";
import { adjustPaddingForOverflow, highlightOpacity } from "powerbi-visuals-core/rendering";

export type svgBaseType = d3.Selection<SVGSVGElement, unknown, null, undefined>;
export type divBaseType = d3.Selection<HTMLDivElement, unknown, null, undefined>;

export class Visual implements powerbi.extensibility.IVisual {
  host: powerbi.extensibility.visual.IVisualHost;
  tableDiv: divBaseType;
  svg: svgBaseType;
  viewModel: viewModelClass;
  plotProperties: plotPropertiesClass;
  selectionManager: powerbi.extensibility.ISelectionManager;

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions | undefined) {
    if (options === undefined) {
      throw new Error("Visual constructor options are required.");
    }
    this.tableDiv = d3.select(options.element).append("div")
                                              .style("overflow", "auto");

    this.svg = d3.select(options.element).append("svg");
    this.host = options.host;
    this.viewModel = new viewModelClass();
    this.plotProperties = new plotPropertiesClass();

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
      if (!update_status.status) {
        this.plotProperties.displayPlot = false;
        this.resizeCanvas(options.viewport.width, options.viewport.height);
        if (this.viewModel?.inputSettings?.settings?.[0]?.canvas?.show_errors ?? true) {
          this.svg.call(drawErrors, options, this.viewModel.colourPalette, update_status.error ?? "", update_status.type);
        } else {
          this.svg.call(initialiseSVG, true);
        }

        this.host.eventService.renderingFailed(options);
        return;
      }

      this.plotProperties.update(options, this.viewModel);

      if (update_status.warning) {
        this.host.displayWarningIcon("Invalid inputs or settings ignored.\n",
                                      update_status.warning);
      }

      if (this.viewModel.showGrouped || this.viewModel.inputSettings.settings[0].summary_table.show_table) {
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
      this.svg.call(drawErrors, options, this.viewModel.colourPalette, (caught_error as Error).message, "internal");
      console.error(caught_error);
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
    // Headless mode does not render to screen so do not attempt to adjust for overflow
    if (this.viewModel.headless) {
      return;
    }
    const node = this.svg.node();
    if (node === null) {
      return;
    }
    const { xAxis, yAxis } = this.plotProperties;
    const padding = adjustPaddingForOverflow(node.getBBox(), this.viewModel.svgWidth, this.viewModel.svgHeight,
      { left: xAxis.start_padding, right: xAxis.end_padding, top: yAxis.end_padding, bottom: yAxis.start_padding });
    if (padding === undefined) {
      return;
    }
    xAxis.start_padding = padding.left;
    xAxis.end_padding = padding.right;
    yAxis.end_padding = padding.top;
    yAxis.start_padding = padding.bottom;
    this.plotProperties.initialiseScale(this.viewModel.svgWidth, this.viewModel.svgHeight);
    this.drawVisual();
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
    const anyHighlights: boolean = this.viewModel.inputData.length > 0
      && this.viewModel.inputData.some(d => d.anyHighlights);
    const allSelectionIDs: ISelectionId[] = this.selectionManager.getSelectionIds() as ISelectionId[];
    const selected = selectedKeys(allSelectionIDs);

    const dotsSelection: d3.Selection<d3.BaseType | SVGPathElement, plotData, d3.BaseType, unknown> = this.svg.selectAll(".dotsgroup").selectChildren();
    // Only the line groups carry line data; the label texts are Core-drawn and unbound
    const linesSelection: d3.Selection<d3.BaseType | SVGGElement, [string, lineData[]], d3.BaseType, unknown> = this.svg.selectAll(".linesgroup").selectChildren("g");
    const tableSelection: d3.Selection<d3.BaseType | HTMLTableRowElement, plotDataGrouped, d3.BaseType, unknown> = this.tableDiv.selectAll(".table-body").selectChildren();

    const active = anyHighlights || allSelectionIDs.length > 0;
    const settings = this.viewModel.inputSettings.settings[0];
    linesSelection.style("stroke-opacity", (d: [string, lineData[]]) => getAesthetic(d[0], "lines", active ? "opacity_unselected" : "opacity", settings));
    const dotOpacity = (d: plotData) => highlightOpacity(d.aesthetics, active, identitySelected(d.identity, selected) || d.highlighted);
    dotsSelection.style("fill-opacity", dotOpacity).style("stroke-opacity", dotOpacity);
    tableSelection.style("opacity", (d: plotDataGrouped) => highlightOpacity({
      opacity: d.aesthetics.table_opacity, opacity_selected: d.aesthetics.table_opacity_selected, opacity_unselected: d.aesthetics.table_opacity_unselected
    }, active, identitySelected(d.identity, selected) || d.highlighted));
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.viewModel.inputSettings.getFormattingModel();
  }
}
