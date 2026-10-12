"use strict";

import type powerbi from "powerbi-visuals-api";
import {
  PlotVisual, drawPlotAxes, drawPlotTooltips, drawPlotDots, drawPlotDownload, drawPlotValueLabels, drawPlotLines,
  drawPlotLineLabels, valueTickFormat, createTableContainer, showTable, highlightTable,
  type SvgSelection, type TableSelection
} from "powerbi-visuals-core/rendering";
import drawIcons from "./D3 Plotting Functions/drawIcons";
import drawSummaryTable from "./D3 Plotting Functions/drawSummaryTable";
import viewModelClass, { type plotData, type plotDataGrouped } from "./Classes/viewModelClass";
import lineKeys from "./Functions/lineKeys";
import type { settingsValueType } from "./settings";
import { selectionState } from "powerbi-visuals-core/powerbi";
import { lineStyle, lowerLimitLines } from "powerbi-visuals-core/settings";

export type svgBaseType = SvgSelection;

export class Visual extends PlotVisual<plotData, viewModelClass, settingsValueType> {
  tableDiv: TableSelection;
  protected readonly lineKeys = lineKeys;

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions | undefined) {
    super(options, host => new viewModelClass(host));
    this.tableDiv = createTableContainer(this.element);
  }

  protected get settings(): settingsValueType {
    return this.viewModel.inputSettings.settings[0];
  }

  protected drawAlternate(): boolean {
    if (!(this.viewModel.showGrouped || this.settings.summary_table.show_table)) {
      return false;
    }
    this.resizeCanvas(0, 0);
    this.tableDiv.call(drawSummaryTable, this);
    this.addContextMenu(this.tableDiv.node(), true);
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
      lower: name => lowerLimitLines.has(name) || name === "speclimits_lower",
      format: viewModel.inputSettings.derivedSettings[0].formatValue,
      periodEnds: viewModel.rebaselineEnds
    });
    drawPlotDots(svg, context, {
      show: settings.scatter.show_dots,
      text: undefined,
      onClick: settings.spc.split_on_click ? point => this.toggleSplit(point) : undefined
    });
    this.svg.call(drawIcons, this);
    this.addContextMenu(svg);
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
    showTable(this.tableDiv, width === 0 && height === 0);
  }

  updateHighlighting(): void {
    const viewModel = this.viewModel;
    let anyHighlights: boolean = false;
    for (let i = 0; i < viewModel.inputData.length && !anyHighlights; i++) {
      anyHighlights = viewModel.inputData[i].anyHighlights;
    }
    const state = selectionState(this.selectionManager, anyHighlights);
    this.highlightPlotPoints(state, point => point.aesthetics);
    highlightTable<plotDataGrouped>(this.tableDiv, state, d => ({
      opacity: d.aesthetics.table_opacity,
      opacity_selected: d.aesthetics.table_opacity_selected,
      opacity_unselected: d.aesthetics.table_opacity_unselected
    }));
  }
}
