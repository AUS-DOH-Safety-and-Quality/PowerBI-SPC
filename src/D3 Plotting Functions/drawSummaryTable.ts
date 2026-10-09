import { select } from "powerbi-visuals-core/rendering";
import type { plotData, plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, Visual } from "../visual";
import initialiseIconSVG from "./initialiseIconSVG";
import { nhsIcons, type NhsIconName } from "./NHS Icons"
import type { settingsValueType } from "../settings";
import { identitySelected, selectionState } from "powerbi-visuals-core/powerbi";
import type { ValueFormatter } from "powerbi-visuals-core/data";

const integerFormattedColumns = new Set(["numerator", "denominator"]);
const numericColumns = new Set([
  "value", "numerator", "denominator", "target", "alt_target", "trend_line", "speclimits_lower", "speclimits_upper",
  "ll99", "ll95", "ll68", "ul68", "ul95", "ul99"
]);
const dateColumns = new Set(["date", "latest_date"]);
const flagColumns = new Set(["astpoint", "trend", "shift"]);
const flagLabels: Record<string, string> = {
  none: "",
  improvement: "Improvement",
  deterioration: "Deterioration",
  neutral_low: "Neutral (Low)",
  neutral_high: "Neutral (High)"
};

/** Grouped rows draw the icon columns as icons rather than text */
function drawsIcons(inputSettings: settingsValueType, showGrouped: boolean): boolean {
  return showGrouped && (inputSettings.nhs_icons.show_variation_icons || inputSettings.nhs_icons.show_assurance_icons);
}

function isIconColumn(column: string): boolean {
  return column === "variation" || column === "assurance";
}

function columnAlignment(setting: settingsValueType["summary_table"]["table_body_text_align"],
                         column: string, drawIcons: boolean): string {
  if (setting !== "auto") {
    return setting;
  }
  if (drawIcons && isIconColumn(column)) {
    return "center";
  }
  return numericColumns.has(column) ? "right" : "left";
}

/** Grouped rows carry their own table settings, ungrouped rows only dot aesthetics */
function rowTableSettings(row: plotData | plotDataGrouped,
                          tableSettings: settingsValueType["summary_table"]): settingsValueType["summary_table"] {
  return ("table_body_bg_colour" in row.aesthetics) ? row.aesthetics : tableSettings;
}

function drawTableHeaders(selection: divBaseType, cols: { name: string; label: string; }[],
                          tableSettings: settingsValueType["summary_table"], drawIcons: boolean) {
  const tableHeaders = selection.select(".table-header")
            .selectAll("th")
            .data(cols)
            .join("th");

  tableHeaders.selectAll("text")
              .data(d => [d.label])
              .join("text")
              .text(d => d)

  // Font set on the cell itself, so wrapped lines take the header's line height
  tableHeaders.style("font-size", `${tableSettings.table_header_size}px`)
            .style("font-family", tableSettings.table_header_font)
            .style("color", tableSettings.table_header_colour)
            .style("padding", `${tableSettings.table_header_text_padding}px`)
            .style("background-color", tableSettings.table_header_bg_colour)
            .style("font-weight", tableSettings.table_header_font_weight)
            .style("text-transform", tableSettings.table_header_text_transform)
            .style("text-align", d => columnAlignment(tableSettings.table_header_text_align, d.name, drawIcons))
            .style("border-width", `${tableSettings.table_header_border_width}px`)
            .style("border-style", tableSettings.table_header_border_style)
            .style("border-color", tableSettings.table_header_border_colour)
            // Cells draw only their bottom and right borders, so neighbours never double up
            .style("border-top", "none")
            .style("border-left", "none")
            .style("position", "sticky")
            .style("top", "0")
            // Rows with opacity below 1 would otherwise paint over the header
            .style("z-index", "1");

  if (!tableSettings.table_header_border_bottom) {
    tableHeaders.style("border-bottom", "none");
  }

  if (!tableSettings.table_header_border_inner) {
    tableHeaders.style("border-right", "none");
  }
}

function drawTableRows(selection: divBaseType, visualObj: Visual,
                       plotPoints: plotData[] | plotDataGrouped[],
                       tableSettings: settingsValueType["summary_table"]) {
  selection.select(".table-body")
           .selectAll('tr')
           .data<plotData | plotDataGrouped>(plotPoints)
           .join('tr')
           .on("click", (event, d) => {
             if (visualObj.host.hostCapabilities.allowInteractions) {
               const alreadySel: boolean = identitySelected(d.identity, selectionState(visualObj.selectionManager, false).selected);
               visualObj.selectionManager
                         .select(d.identity, alreadySel || event.ctrlKey || event.metaKey)
                         .then(() => visualObj.updateHighlighting());
               event.stopPropagation();
             }
           })
           .on("mouseenter", function() {
             select(this).selectAll("td").style("background-color", "whitesmoke");
           })
           .on("mouseleave", function(_event, d) {
             select(this).selectAll("td").style("background-color", rowTableSettings(d, tableSettings).table_body_bg_colour);
           });
}

/** Applied to the cells, as tables ignore width limits on rows */
function drawTextOverflow(selection: divBaseType, tableSettings: settingsValueType["summary_table"], maxWidth: number) {
  const cells = selection.selectAll("th, td");
  if (tableSettings.table_text_overflow !== "none") {
    cells.style("overflow", "hidden")
         .style("max-width", `${maxWidth}px`)
         .style("text-overflow", tableSettings.table_text_overflow);
  } else {
    cells.style("overflow", "auto")
         .style("max-width", "none")
  }
}

function drawOuterBorder(selection: divBaseType, tableSettings: settingsValueType["summary_table"]) {
  selection.select(".table-group")
            .style("border-width", `${tableSettings.table_outer_border_width}px`)
            .style("border-style", tableSettings.table_outer_border_style)
            .style("border-color", tableSettings.table_outer_border_colour);

  const sides = ["top", "right", "bottom", "left"];
  for (let i = 0; i < sides.length; i++) {
    if (!tableSettings[`table_outer_border_${sides[i]}` as keyof settingsValueType["summary_table"]]) {
      selection.select(".table-group").style(`border-${sides[i]}`, "none");
    }
  }

  selection.selectAll("th:last-child")
          .style("border-right", "inherit");
  selection.selectAll("td:last-child")
            .style("border-right", "inherit");
  selection.selectAll("tr:last-child")
            .selectAll("td")
            .style("border-bottom", "inherit");
}

function drawTableCells(selection: divBaseType, cols: { name: string; label: string; }[],
                        inputSettings: settingsValueType, drawIcons: boolean,
                        formatValues: ValueFormatter) {
  const tableCells = selection.select(".table-body")
            .selectAll<HTMLTableRowElement, plotData | plotDataGrouped>('tr')
            .selectAll<HTMLTableCellElement, unknown>('td')
            .data(d => {
              const row: Readonly<Record<string, string | number | undefined>> = d.table_row;
              const cells = new Array<{ column: string; value: string | number | undefined }>(cols.length);
              for (let i = 0; i < cols.length; i++) {
                cells[i] = { column: cols[i].name, value: row[cols[i].name] };
              }
              return cells;
            })
            .join('td');

  tableCells.each(function(d) {
    const currNode = select(this);
    const rowData = select<HTMLElement | null, plotData | plotDataGrouped>(this.parentElement).datum();
    const iconCell: boolean = drawIcons && isIconColumn(d.column);
    if (!iconCell) {
      // Grouped rows are pre-formatted strings; ungrouped rows still carry raw numbers and flag directions here
      let value: string = "";
      if (typeof d.value === "number") {
        value = formatValues(d.value, integerFormattedColumns.has(d.column) ? "integer" : "value");
      } else if (d.value !== undefined) {
        value = flagColumns.has(d.column) ? flagLabels[d.value] : d.value;
      }

      currNode.text(value).classed("cell-text", true);
    }
    const tableAesthetics: settingsValueType["summary_table"] = rowTableSettings(rowData, inputSettings.summary_table);
    currNode.style("background-color", tableAesthetics.table_body_bg_colour)
            .style("font-weight", tableAesthetics.table_body_font_weight)
            .style("text-transform", tableAesthetics.table_body_text_transform)
            .style("text-align", columnAlignment(tableAesthetics.table_body_text_align, d.column, drawIcons))
            .style("font-size", `${tableAesthetics.table_body_size}px`)
            .style("font-family", tableAesthetics.table_body_font)
            .style("color", tableAesthetics.table_body_colour)
            .style("border-width", `${tableAesthetics.table_body_border_width}px`)
            .style("border-style", tableAesthetics.table_body_border_style)
            .style("border-color", tableAesthetics.table_body_border_colour)
            .style("border-top", "none")
            .style("border-left", "none")
            .style("padding", `${tableAesthetics.table_body_text_padding}px`)
            .style("opacity", "inherit")
            // Cells are reused across updates, so a former icon cell must wrap again
            .style("white-space", (iconCell || dateColumns.has(d.column)) ? "nowrap" : "normal");

    if (!tableAesthetics.table_body_border_left_right) {
      currNode.style("border-right", "none");
    }
    if (!tableAesthetics.table_body_border_top_bottom) {
      currNode.style("border-bottom", "none");
    }
  })
}

/** Square icons share one size: the shortest row's content height, capped so the icon columns' combined width holds them */
function drawIconCells(selection: divBaseType, nhsIconSettings: settingsValueType["nhs_icons"]) {
  const iconCells = selection.select(".table-body")
                             .selectAll("tr")
                             .selectAll<HTMLTableCellElement, { column: string }>("td")
                             .filter(d => isIconColumn(d.column));
  const cells = iconCells.nodes();
  const data = iconCells.data();
  const icons = new Array<NhsIconName[]>(cells.length);
  let rowHeight: number = Number.POSITIVE_INFINITY;
  const columnWidths: Record<string, number> = { variation: 0, assurance: 0 };
  const maxIcons: Record<string, number> = { variation: 0, assurance: 0 };
  // Measured before drawing; the variation column widens only by what the assurance column gives up
  for (let i = 0; i < cells.length; i++) {
    const column = data[i].column;
    const row = select<HTMLElement | null, plotDataGrouped>(cells[i].parentElement).datum();
    const assurance = row.table_row.assurance;
    icons[i] = column === "variation" ? row.variation_icons : (assurance === "none" ? [] : [assurance]);
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
  const baseSize: number = Math.min(rowHeight, widthCap);
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

export default function drawSummaryTable(selection: divBaseType, visualObj: Visual) {
  selection.selectAll(".rowsvg").remove();
  selection.selectAll(".cell-text").remove();

  const viewModel = visualObj.viewModel;
  const plotPoints: plotData[] | plotDataGrouped[] = viewModel.showGrouped ? viewModel.groupedRows : viewModel.plotPoints;
  const cols = viewModel.tableColumns[0];

  const maxWidth: number = visualObj.viewModel.svgWidth / cols.length;
  const inputSettings = visualObj.viewModel.inputSettings.settings[0];
  const tableSettings = inputSettings.summary_table;
  const draw_icons: boolean = drawsIcons(inputSettings, viewModel.showGrouped);

  selection.call(drawTableHeaders, cols, tableSettings, draw_icons)
            .call(drawTableRows, visualObj, plotPoints, tableSettings);

  if (plotPoints.length > 0) {
    const formatValues = visualObj.viewModel.inputSettings.derivedSettings[0].formatValue;
    selection.call(drawTableCells, cols, inputSettings, draw_icons, formatValues)
  }

  selection.call(drawTextOverflow, tableSettings, maxWidth)
           .call(drawOuterBorder, tableSettings);
  // Icons are sized from the final cell heights, so follow the borders
  if (plotPoints.length > 0 && draw_icons) {
    drawIconCells(selection, inputSettings.nhs_icons);
  }

  selection.on('click', () => {
    visualObj.selectionManager.clear();
    visualObj.updateHighlighting();
  });
}
