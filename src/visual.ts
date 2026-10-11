"use strict";

import type powerbi from "powerbi-visuals-api";
import {
  PlotVisual, select, drawPlotAxes, drawPlotTooltips, drawPlotDots, drawPlotDownload, drawPlotValueLabels, drawPlotLines,
  drawPlotLineLabels, highlightOpacity, valueTickFormat, type Selection, type BaseType, type AxisBounds, type SvgSelection
} from "powerbi-visuals-core/rendering";
import drawIcons from "./D3 Plotting Functions/drawIcons";
import addContextMenu from "./D3 Plotting Functions/addContextMenu";
import drawSummaryTable from "./D3 Plotting Functions/drawSummaryTable";
import viewModelClass, { type plotData, type plotDataGrouped } from "./Classes/viewModelClass";
import axisRanges from "./Functions/axisRanges";
import lineKeys from "./Functions/lineKeys";
import type { settingsValueType } from "./settings";
import { identitySelected, selectionState } from "powerbi-visuals-core/powerbi";
import { lineStyle } from "powerbi-visuals-core/settings";

export type svgBaseType = SvgSelection;
export type divBaseType = Selection<HTMLDivElement, unknown, null, undefined>;

/** Lower boundary lines place outside labels below the line */
const lowerLines = new Set<string>(["ll99", "ll95", "ll68", "speclimits_lower"]);

export class Visual extends PlotVisual<plotData, viewModelClass, settingsValueType> {
  tableDiv: divBaseType;
  protected readonly lineKeys = lineKeys;

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions | undefined) {
    super(options, () => new viewModelClass());
    this.tableDiv = select(this.element).insert("div", "svg")
                                        .style("overflow", "auto");
    // Collapsed borders stay behind when the sticky header scrolls, so cells draw their own
    const table = this.tableDiv.append("table")
                                .classed("table-group", true)
                                .style("border-collapse", "separate")
                                .style("border-spacing", "0")
                                .style("width", "100%");

    table.append("thead").append("tr").classed("table-header", true);
    table.append('tbody').classed("table-body", true);
  }

  protected get settings(): settingsValueType {
    return this.viewModel.inputSettings.settings[0];
  }

  protected axisRanges(): { x: AxisBounds; y: AxisBounds } {
    return axisRanges(this.viewModel);
  }

  protected drawAlternate(): boolean {
    if (!(this.viewModel.showGrouped || this.settings.summary_table.show_table)) {
      return false;
    }
    this.resizeCanvas(0, 0);
    this.tableDiv.call(drawSummaryTable, this)
                 .call(addContextMenu, this, true);
    return true;
  }

  drawVisual(): void {
    const svg = this.svg.node();
    if (svg === null) {
      return;
    }
    const viewModel = this.viewModel;
    const settings = this.settings;
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
    // Each point carries its own row's line settings, so rebaselined segments may differ
    drawPlotLines(svg, context, viewModel.groupedLines, (name, points, index) => lineStyle(points[index].aesthetics, lineKeys[name]));
    drawPlotLineLabels(svg, context, {
      lines: viewModel.groupedLines,
      settings: settings.lines,
      keys: lineKeys,
      lower: name => lowerLines.has(name),
      format: viewModel.inputSettings.derivedSettings[0].formatValue,
      periodEnds: viewModel.rebaselineEnds
    });
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
    drawPlotValueLabels(svg, context, viewModel.inputData[0].anyLabels);
  }

  /** Toggles a limit split at the point; persisting it triggers the update that recalculates the limits */
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

  resizeCanvas(width: number, height: number): void {
    super.resizeCanvas(width, height);
    if (width === 0 && height === 0) {
      this.tableDiv.style("width", "100%").style("height", "100%");
    } else {
      this.tableDiv.style("width", "0%").style("height", "0%");
    }
  }

  updateHighlighting(): void {
    const viewModel = this.viewModel;
    let anyHighlights: boolean = false;
    for (let i = 0; i < viewModel.inputData.length && !anyHighlights; i++) {
      anyHighlights = viewModel.inputData[i].anyHighlights;
    }
    const state = selectionState(this.selectionManager, anyHighlights);
    this.highlightPlotPoints(state, point => point.aesthetics);
    const tableSelection: Selection<BaseType | HTMLTableRowElement, plotDataGrouped, BaseType, unknown> = this.tableDiv.selectAll(".table-body").selectChildren();
    tableSelection.style("opacity", (d: plotDataGrouped) => highlightOpacity({
      opacity: d.aesthetics.table_opacity,
      opacity_selected: d.aesthetics.table_opacity_selected,
      opacity_unselected: d.aesthetics.table_opacity_unselected
    }, state.active, identitySelected(d.identity, state.selected) || d.highlighted));
  }
}
