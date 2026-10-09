"use strict";

import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import * as d3 from "./D3 Plotting Functions/D3 Modules";
import drawLines from "./D3 Plotting Functions/drawLines";
import drawIcons from "./D3 Plotting Functions/drawIcons";
import addContextMenu from "./D3 Plotting Functions/addContextMenu";
import drawSummaryTable from "./D3 Plotting Functions/drawSummaryTable";
import drawLineLabels from "./D3 Plotting Functions/drawLineLabels";
import viewModelClass, { type plotData, type viewModelValidationT } from "./Classes/viewModelClass";
import type { plotDataGrouped } from "./Classes/viewModelClass";
import axisRanges from "./Functions/axisRanges";
import lineKeys from "./Functions/lineKeys";
import { identitySelected, selectionState } from "powerbi-visuals-core/powerbi";
import { lineOpacity } from "powerbi-visuals-core/settings";
import {
  createPlotFrame, fitPlotToOverflow, highlightOpacity, highlightPlot, initialiseSvg, drawErrorMessage,
  drawPlotAxes, drawPlotTooltips, drawPlotDots, drawPlotDownload, drawPlotValueLabels, valueTickFormat,
  type ErrorKind, type PlotContext, type PlotFrame
} from "powerbi-visuals-core/rendering";

export type svgBaseType = d3.Selection<SVGSVGElement, unknown, null, undefined>;
export type divBaseType = d3.Selection<HTMLDivElement, unknown, null, undefined>;

export class Visual implements powerbi.extensibility.IVisual {
  host: powerbi.extensibility.visual.IVisualHost;
  tableDiv: divBaseType;
  svg: svgBaseType;
  viewModel: viewModelClass;
  selectionManager: powerbi.extensibility.ISelectionManager;
  private currentPlotProperties: PlotFrame | undefined;

  get plotProperties(): PlotFrame {
    if (this.currentPlotProperties === undefined) {
      throw new Error("Plot properties require validated data.");
    }
    return this.currentPlotProperties;
  }

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions | undefined) {
    if (options === undefined) {
      throw new Error("Visual constructor options are required.");
    }
    this.tableDiv = d3.select(options.element).append("div")
                                              .style("overflow", "auto");

    this.svg = d3.select(options.element).append("svg");
    this.host = options.host;
    this.viewModel = new viewModelClass();

    this.selectionManager = this.host.createSelectionManager();
    this.selectionManager.registerOnSelectCallback(() => this.updateHighlighting());

    const svg = this.svg.node();
    if (svg !== null) {
      initialiseSvg(svg);
    }
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
        this.currentPlotProperties = undefined;
        this.resizeCanvas(options.viewport.width, options.viewport.height);
        this.drawErrors(options, update_status.error ?? "", update_status.type,
                        this.viewModel?.inputSettings?.settings?.[0]?.canvas?.show_errors ?? true);

        this.host.eventService.renderingFailed(options);
        return;
      }

      const viewModel = this.viewModel;
      this.currentPlotProperties = createPlotFrame({
        width: options.viewport.width,
        height: options.viewport.height,
        displayPlot: (viewModel.plotPoints[0]?.length ?? 0) > 0,
        ...axisRanges(viewModel),
        settings: viewModel.inputSettings.settings[0],
        palette: viewModel.colourPalette
      });

      if (update_status.warning) {
        this.host.displayWarningIcon("Invalid inputs or settings ignored.\n",
                                      update_status.warning);
      }

      if (viewModel.showGrouped || viewModel.inputSettings.settings[0].summary_table.show_table) {
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
      this.currentPlotProperties = undefined;
      this.resizeCanvas(options.viewport.width, options.viewport.height);
      this.drawErrors(options, (caught_error as Error).message, "internal", true);
      console.error(caught_error);
      this.host.eventService.renderingFailed(options);
    }
  }

  drawErrors(options: VisualUpdateOptions, message: string, kind: ErrorKind | undefined, show: boolean): void {
    const svg = this.svg.node();
    if (svg === null) {
      return;
    }
    drawErrorMessage(svg, {
      width: options.viewport.width, height: options.viewport.height,
      message, kind, show, colour: this.viewModel.colourPalette.foregroundColour
    });
  }

  plotContext(): PlotContext<plotData> {
    const viewModel = this.viewModel;
    return {
      frame: this.plotProperties,
      points: viewModel.plotPoints[0] as plotData[],
      palette: viewModel.colourPalette,
      settings: viewModel.inputSettings.settings[0],
      host: this.host,
      selectionManager: this.selectionManager,
      onSelectionChange: () => this.updateHighlighting(),
      headless: viewModel.headless,
      frontend: viewModel.frontend
    };
  }

  drawVisual(): void {
    const svg = this.svg.node();
    if (svg === null) {
      return;
    }
    const viewModel = this.viewModel;
    const settings = viewModel.inputSettings.settings[0];
    const context = this.plotContext();
    const tickLabels = viewModel.tickLabels;
    drawPlotAxes(svg, context, {
      x: value => {
        for (let i = 0; i < tickLabels.length; i++) {
          if (tickLabels[i].x === value) {
            return tickLabels[i].label;
          }
        }
        return "";
      },
      y: valueTickFormat(settings.y_axis.ylimit_sig_figs ?? settings.spc.sig_figs, viewModel.inputSettings.derivedSettings[0].percentLabels)
    });
    drawPlotTooltips(svg, context, false);
    this.svg.call(drawLines, this)
            .call(drawLineLabels, this);
    drawPlotDots(svg, context, {
      show: settings.scatter.show_dots,
      text: undefined,
      onClick: settings.spc.split_on_click ? point => this.toggleSplit(point) : undefined
    });
    this.svg.call(drawIcons, this)
            .call(addContextMenu, this);
    drawPlotDownload(svg, context, () => {
      const points = context.points;
      const rows = new Array<plotData["table_row"]>(points.length);
      for (let i = 0; i < points.length; i++) {
        rows[i] = points[i].table_row;
      }
      return rows;
    });
    drawPlotValueLabels(svg, context, viewModel.inputData[0]?.anyLabels ?? false);
  }

  // Toggles a limit split at the point; persisting it triggers the update that recalculates the limits
  toggleSplit(point: plotData): void {
    const splitIndexes = this.viewModel.splitIndexes;
    const xIndex = splitIndexes.indexOf(point.x);
    if (xIndex > -1) {
      splitIndexes.splice(xIndex, 1);
    } else {
      splitIndexes.push(point.x);
    }
    this.host.persistProperties({
      replace: [{
        objectName: "split_indexes_storage",
        selector: {},
        properties: { split_indexes: JSON.stringify(splitIndexes) }
      }]
    });
  }

  adjustPaddingForOverflow(): void {
    // Headless mode does not render to screen so do not attempt to adjust for overflow
    if (this.viewModel.headless) {
      return;
    }
    const svg = this.svg.node();
    if (svg === null) {
      return;
    }
    const fitted = fitPlotToOverflow(svg, this.plotProperties);
    if (fitted === undefined) {
      return;
    }
    this.currentPlotProperties = fitted;
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
    const viewModel = this.viewModel;
    const anyHighlights: boolean = viewModel.inputData.length > 0 && viewModel.inputData.some(d => d.anyHighlights);
    const { active, selected } = selectionState(this.selectionManager, anyHighlights);
    const settings = viewModel.inputSettings.settings[0];
    const svg = this.svg.node();
    if (svg !== null) {
      highlightPlot<plotData>(svg, {
        active, selected,
        lineOpacity: line => lineOpacity(settings.lines, lineKeys[line.name], active),
        dotOpacities: point => point.aesthetics
      });
    }
    const tableSelection: d3.Selection<d3.BaseType | HTMLTableRowElement, plotDataGrouped, d3.BaseType, unknown> = this.tableDiv.selectAll(".table-body").selectChildren();
    tableSelection.style("opacity", (d: plotDataGrouped) => highlightOpacity({
      opacity: d.aesthetics.table_opacity, opacity_selected: d.aesthetics.table_opacity_selected, opacity_unselected: d.aesthetics.table_opacity_unselected
    }, active, identitySelected(d.identity, selected) || d.highlighted));
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.viewModel.inputSettings.getFormattingModel();
  }
}
