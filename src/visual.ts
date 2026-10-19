"use strict";

import type powerbi from "powerbi-visuals-api";
import {
  PlotVisual, valueTickFormat, createTableContainer, showTable, highlightTable, type PlotOptions, type MarksSelection, type TableSelection
} from "powerbi-visuals-core/rendering";
import drawIcons from "./D3 Plotting Functions/drawIcons";
import drawSummaryTable from "./D3 Plotting Functions/drawSummaryTable";
import viewModelClass, { type lineData, type plotData, type plotDataGrouped } from "./Classes/viewModelClass";
import lineKeys from "./Functions/lineKeys";
import type { settingsValueType } from "./settings";
import { selectionState } from "powerbi-visuals-core/powerbi";
import { lowerLimitLines } from "powerbi-visuals-core/settings";

const lowerLines: ReadonlySet<string> = new Set(lowerLimitLines).add("speclimits_lower");

export class Visual extends PlotVisual<plotData, viewModelClass, settingsValueType, lineData> {
  readonly tableDiv: TableSelection;
  protected readonly lineKeys = lineKeys;

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions | undefined) {
    super(options, host => new viewModelClass(host));
    this.tableDiv = createTableContainer(this.element);
  }

  protected get settings(): settingsValueType {
    return this.viewModel.inputSettings.settings[0];
  }

  protected override drawAlternate(): boolean {
    if (!(this.viewModel.showGrouped || this.settings.summary_table.show_table)) {
      return false;
    }
    this.resizeCanvas(0, 0);
    this.tableDiv.call(drawSummaryTable, this);
    this.addContextMenu(this.tableDiv.node(), true);
    return true;
  }

  protected plotOptions(): PlotOptions<plotData, lineData> {
    const viewModel = this.viewModel;
    const settings = this.settings;
    const tickLabels = viewModel.tickLabels;
    const derivedSettings = viewModel.inputSettings.derivedSettings[0];
    const integerTicks: boolean = derivedSettings.chart_type_props.integer_values && derivedSettings.multiplier === 1;
    return {
      tickFormats: {
        x: value => {
          for (let i = 0; i < tickLabels.length; i++) {
            if (tickLabels[i].x === value) {
              return tickLabels[i].label;
            }
          }
          return "";
        },
        y: valueTickFormat(settings.y_axis.ylimit_sig_figs ?? (integerTicks ? 0 : settings.spc.sig_figs), derivedSettings.percentLabels),
        yInteger: integerTicks
      },
      verticalCrosshair: false,
      // Each point carries its own row's line settings, so rebaselined segments may differ
      lineSettings: (points, index) => points[index].aesthetics,
      lowerLines,
      dots: {
        show: settings.scatter.show_dots,
        text: undefined,
        onClick: settings.spc.split_on_click ? point => this.toggleSplit(point) : undefined
      }
    };
  }

  protected override drawMarks(marks: MarksSelection): void {
    marks.call(drawIcons, this);
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

  override resizeCanvas(width: number, height: number): void {
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
