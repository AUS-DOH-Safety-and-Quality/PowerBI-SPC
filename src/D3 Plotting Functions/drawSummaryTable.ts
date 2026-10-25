import { select, drawSummaryTable as drawTable, type ColumnKind, type TableSelection } from "powerbi-visuals-core/rendering";
import type { plotData, plotDataGrouped } from "../Classes/viewModelClass";
import type { Visual } from "../visual";
import initialiseIconSVG from "./initialiseIconSVG";
import { nhsIcons, type NhsIconName } from "./NHS Icons"
import type { settingsValueType } from "../settings";

const columnKinds: Readonly<Record<string, ColumnKind>> = {
  value: "number", target: "number", alt_target: "number", trend_line: "number", speclimits_lower: "number", speclimits_upper: "number",
  ll99: "number", ll95: "number", ll68: "number", ul68: "number", ul95: "number", ul99: "number",
  numerator: "input", denominator: "input",
  date: "date", latest_date: "date",
  astpoint: "flag", trend: "flag", shift: "flag", two_in_three: "flag"
};
const iconKinds: Readonly<Record<string, ColumnKind>> = { ...columnKinds, variation: "icon", assurance: "icon" };

/** Grouped rows draw the icon columns as icons rather than text */
function drawsIcons(inputSettings: settingsValueType, showGrouped: boolean): boolean {
  return showGrouped && (inputSettings.nhs_icons.show_variation_icons || inputSettings.nhs_icons.show_assurance_icons);
}

// Icons outgrow the text so their glyphs stay legible, at the cost of taller rows
const iconRowHeightRatio: number = 2.1875;

function isIconColumn(column: string): boolean {
  return column === "variation" || column === "assurance";
}

/** Grouped rows carry their own table settings, ungrouped rows only dot aesthetics */
function rowTableSettings(row: plotData | plotDataGrouped,
                          tableSettings: settingsValueType["summary_table"]): settingsValueType["summary_table"] {
  return ("table_body_bg_colour" in row.aesthetics) ? row.aesthetics : tableSettings;
}

/** Square icons share one size: a multiple of the shortest row's content height, capped so the icon columns' combined width holds them */
function drawIconCells(selection: TableSelection, nhsIconSettings: settingsValueType["nhs_icons"]): void {
  const allCells = selection.select(".table-body")
                            .selectAll("tr")
                            .selectAll<HTMLTableCellElement, { column: string }>("td");
  const allNodes = allCells.nodes();
  const allData = allCells.data();
  const cells: HTMLTableCellElement[] = [];
  const data: { column: string }[] = [];
  for (let i = 0; i < allNodes.length; i++) {
    if (isIconColumn(allData[i].column)) {
      cells.push(allNodes[i]);
      data.push(allData[i]);
    }
  }
  const icons = new Array<readonly NhsIconName[]>(cells.length);
  let rowHeight: number = Number.POSITIVE_INFINITY;
  const columnWidths: Record<string, number> = { variation: 0, assurance: 0 };
  const maxIcons: Record<string, number> = { variation: 0, assurance: 0 };
  // Measured before drawing; the variation column widens only by what the assurance column gives up
  for (let i = 0; i < cells.length; i++) {
    const column = data[i].column;
    const row = select<HTMLElement | null, plotDataGrouped>(cells[i].parentElement).datum();
    const assurance = row.table_row.assurance;
    if (column === "variation") {
      icons[i] = row.variation_icons;
    } else if (assurance === "none") {
      icons[i] = [];
    } else {
      icons[i] = [assurance];
    }
    maxIcons[column] = Math.max(maxIcons[column], icons[i].length);
    const style = getComputedStyle(cells[i]);
    const rect = cells[i].getBoundingClientRect();
    rowHeight = Math.min(rowHeight, rect.height
      - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth));
    columnWidths[column] = rect.width
      - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
  }
  const widthCap: number = (columnWidths.variation + columnWidths.assurance)
    / Math.max(1, maxIcons.variation + maxIcons.assurance);
  const baseSize: number = Math.min(rowHeight * iconRowHeightRatio, widthCap);
  for (let i = 0; i < cells.length; i++) {
    const variation: boolean = data[i].column === "variation";
    const scaling: number = variation ? nhsIconSettings.variation_icons_scaling : nhsIconSettings.assurance_icons_scaling;
    const size: number = baseSize * scaling;
    const cell = select(cells[i]);
    for (let j = 0; j < icons[i].length; j++) {
      const icon = icons[i][j];
      cell.append("svg")
          .attr("width", `${size}px`)
          .attr("height", `${size}px`)
          .attr("viewBox", "0 0 378 378")
          .style("vertical-align", "top")
          .classed("rowsvg", true)
          .call(initialiseIconSVG, icon)
          .selectAll(".icongroup")
          .selectAll(`.${icon}`)
          .call(nhsIcons[icon]);
    }
  }
}

export default function drawSummaryTable(selection: TableSelection, visualObj: Visual): void {
  const viewModel = visualObj.viewModel;
  const plotPoints: plotData[] | plotDataGrouped[] = viewModel.showGrouped ? viewModel.groupedRows : viewModel.plotPoints;
  const inputSettings = viewModel.inputSettings.settings[0];
  const tableSettings = inputSettings.summary_table;
  const draw_icons: boolean = drawsIcons(inputSettings, viewModel.showGrouped);

  drawTable<plotData | plotDataGrouped>(selection, {
    columns: viewModel.tableColumns[0],
    rows: plotPoints,
    kinds: draw_icons ? iconKinds : columnKinds,
    settings: tableSettings,
    rowSettings: row => rowTableSettings(row, tableSettings),
    formatValue: viewModel.inputSettings.derivedSettings[0].formatValue,
    width: viewModel.svgWidth,
    host: visualObj.host,
    selectionManager: visualObj.selectionManager,
    onSelectionChange: () => visualObj.updateHighlighting()
  });
  // Icons are sized from the final cell heights, so follow the borders
  if (plotPoints.length > 0 && draw_icons) {
    drawIconCells(selection, inputSettings.nhs_icons);
  }
}
