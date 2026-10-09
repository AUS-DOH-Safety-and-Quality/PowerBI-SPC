import { select } from "powerbi-visuals-core/rendering";
import type { plotData, plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, Visual } from "../visual";
import initialiseIconSVG from "./initialiseIconSVG";
import { nhsIcons, isNhsIcon } from "./NHS Icons"
import type { settingsValueType } from "../settings";
import { identitySelected, selectionState } from "powerbi-visuals-core/powerbi";
import type { ValueFormatter } from "powerbi-visuals-core/data";

const integerFormattedColumns = new Set(["numerator", "denominator"]);

function drawTableHeaders(selection: divBaseType, cols: { name: string; label: string; }[],
                          tableSettings: settingsValueType["summary_table"], maxWidth: number) {
  const tableHeaders = selection.select(".table-header")
            .selectAll("th")
            .data(cols)
            .join("th");

  tableHeaders.selectAll("text")
              .data(d => [d.label])
              .join("text")
              .text(d => d)
              .style("font-size", `${tableSettings.table_header_size}px`)
              .style("font-family", tableSettings.table_header_font)
              .style("color", tableSettings.table_header_colour)

  tableHeaders.style("padding", `${tableSettings.table_header_text_padding}px`)
            .style("background-color", tableSettings.table_header_bg_colour)
            .style("font-weight", tableSettings.table_header_font_weight)
            .style("text-transform", tableSettings.table_header_text_transform)
            .style("text-align", tableSettings.table_header_text_align)
            .style("border-width", `${tableSettings.table_header_border_width}px`)
            .style("border-style", tableSettings.table_header_border_style)
            .style("border-color", tableSettings.table_header_border_colour)
            // Top border of header controlled by outer border
            .style("border-top", "inherit");

  if (!tableSettings.table_header_border_bottom) {
    tableHeaders.style("border-bottom", "none");
  }

  if (!tableSettings.table_header_border_inner) {
    tableHeaders.style("border-left", "none")
                .style("border-right", "none");
  }

  if (tableSettings.table_text_overflow !== "none") {
    tableHeaders.style("overflow", "hidden")
                .style("max-width", `${maxWidth}px`)
                .style("text-overflow", tableSettings.table_text_overflow);
  } else {
    tableHeaders.style("overflow", "auto")
                .style("max-width", "none")
  }
}

function drawTableRows(selection: divBaseType, visualObj: Visual,
                       plotPoints: plotData[] | plotDataGrouped[],
                       tableSettings: settingsValueType["summary_table"],
                       maxWidth: number) {
  const tableRows = selection
                        .select(".table-body")
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
                        .on("mouseover", (event) => {
                          select(event.target as Element).select(function(){
                            return this.closest("td");
                          }).style("background-color", "lightgray");
                        })
                        .on("mouseout", (event) => {
                          let currentTD = select(event.target as Element).select(function(){
                            return this.closest("td");
                          })
                          const rowData = select<HTMLElement | null, plotData | plotDataGrouped>(currentTD.node()!.parentElement).datum();
                          if ("table_body_bg_colour" in rowData.aesthetics) {
                            currentTD.style("background-color", rowData.aesthetics.table_body_bg_colour ?? "inherit");
                          } else {
                            currentTD.style("background-color", "inherit");
                          }
                        });

  if (tableSettings.table_text_overflow !== "none") {
    tableRows.style("overflow", "hidden")
                .style("max-width", `${maxWidth}px`)
                .style("text-overflow", tableSettings.table_text_overflow);
  } else {
    tableRows.style("overflow", "auto")
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

  selection.selectAll("th:first-child")
           .style("border-left", "inherit");
  selection.selectAll("th:last-child")
          .style("border-right", "inherit");
  selection.selectAll("td:first-child")
           .style("border-left", "inherit");
  selection.selectAll("td:last-child")
            .style("border-right", "inherit");
  selection.selectAll("tr:first-child")
            .selectAll("td")
            .style("border-top", "inherit");
  selection.selectAll("tr:last-child")
            .selectAll("td")
            .style("border-bottom", "inherit");
}

function drawTableCells(selection: divBaseType, cols: { name: string; label: string; }[],
                        inputSettings: settingsValueType, showGrouped: boolean,
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

  const draw_icons: boolean = inputSettings.nhs_icons.show_variation_icons || inputSettings.nhs_icons.show_assurance_icons;
  const thisSelDims = tableCells.node()!.getBoundingClientRect()

  tableCells.each(function(d) {
    const currNode = select(this);
    const rowData = select<HTMLElement | null, plotData | plotDataGrouped>(this.parentElement).datum();
    if (showGrouped && draw_icons && (d.column === "variation" || d.column === "assurance")) {
      const icon = d.value;
      if (typeof icon === "string" && isNhsIcon(icon)) {
        const scaling = inputSettings.nhs_icons[`${d.column}_icons_scaling`];
        currNode
            .append("svg")
            .attr("width", `${thisSelDims.width * 0.5 * scaling}px`)
            .attr("viewBox", "0 0 378 378")
            .classed("rowsvg", true)
            .call(initialiseIconSVG, icon)
            .selectAll(".icongroup")
            .selectAll(`.${icon}`)
            .call(nhsIcons[icon]);
      }
    } else {
      // Grouped rows are pre-formatted strings; ungrouped rows still carry raw numbers here
      const value: string = typeof d.value === "number"
        ? formatValues(d.value, integerFormattedColumns.has(d.column) ? "integer" : "value")
        : (d.value ?? "");

      currNode.text(value).classed("cell-text", true);
    }
    const tableAesthetics: settingsValueType["summary_table"]
      = ("table_body_bg_colour" in rowData.aesthetics)
                              ? rowData.aesthetics
                              : inputSettings.summary_table;
    currNode.style("background-color", tableAesthetics.table_body_bg_colour)
            .style("font-weight", tableAesthetics.table_body_font_weight)
            .style("text-transform", tableAesthetics.table_body_text_transform)
            .style("text-align", tableAesthetics.table_body_text_align)
            .style("font-size", `${tableAesthetics.table_body_size}px`)
            .style("font-family", tableAesthetics.table_body_font)
            .style("color", tableAesthetics.table_body_colour)
            .style("border-width", `${tableAesthetics.table_body_border_width}px`)
            .style("border-style", tableAesthetics.table_body_border_style)
            .style("border-color", tableAesthetics.table_body_border_colour)
            .style("padding", `${tableAesthetics.table_body_text_padding}px`)
            .style("opacity", "inherit");

    if (!tableAesthetics.table_body_border_left_right) {
      currNode.style("border-left", "none")
              .style("border-right", "none");
    }
    if (!tableAesthetics.table_body_border_top_bottom) {
      currNode.style("border-top", "none")
              .style("border-bottom", "none");
    }
  })
}

export default function drawSummaryTable(selection: divBaseType, visualObj: Visual) {
  selection.selectAll(".rowsvg").remove();
  selection.selectAll(".cell-text").remove();

  const viewModel = visualObj.viewModel;
  const plotPoints: plotData[] | plotDataGrouped[] = viewModel.showGrouped ? viewModel.groupedRows : viewModel.plotPoints;
  const cols = viewModel.tableColumns[0];

  const maxWidth: number = visualObj.viewModel.svgWidth / cols.length;
  const tableSettings = visualObj.viewModel.inputSettings.settings[0].summary_table;

  selection.call(drawTableHeaders, cols, tableSettings, maxWidth)
            .call(drawTableRows, visualObj, plotPoints, tableSettings, maxWidth);

  if (plotPoints.length > 0) {
    const formatValues = visualObj.viewModel.inputSettings.derivedSettings[0].formatValue;
    selection.call(drawTableCells, cols, visualObj.viewModel.inputSettings.settings[0], visualObj.viewModel.showGrouped, formatValues)
  }

  selection.call(drawOuterBorder, tableSettings);

  selection.on('click', () => {
    visualObj.selectionManager.clear();
    visualObj.updateHighlighting();
  });
}
