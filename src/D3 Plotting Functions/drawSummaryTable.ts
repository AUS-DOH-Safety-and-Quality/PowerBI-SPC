import { plotData, type plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, Visual } from "../visual";
import initialiseIconSVG from "./initialiseIconSVG";
import * as nhsIcons from "./NHS Icons"
import * as d3 from "./D3 Modules";
import type { defaultSettingsType } from "../Classes/settingsClass";
import identitySelected from "../Functions/identitySelected";

function drawTableHeaders(selection: divBaseType, cols: { name: string; label: string; }[],
                          tableSettings: defaultSettingsType["summary_table"], maxWidth: number) {
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
                       tableSettings: defaultSettingsType["summary_table"],
                       maxWidth: number) {
  const tableRows = selection
                        .select(".table-body")
                        .selectAll('tr')
                        .data(<plotData[]>plotPoints)
                        .join('tr')
                        .on("click", (event, d: plotData) => {
                          if (visualObj.host.hostCapabilities.allowInteractions) {
                            const alreadySel: boolean = identitySelected(d.identity, visualObj.selectionManager);
                            visualObj.selectionManager
                                      .select(d.identity, alreadySel || event.ctrlKey || event.metaKey)
                                      .then(() => visualObj.updateHighlighting());
                            event.stopPropagation();
                          }
                        })
                        .on("mouseover", (event) => {
                          d3.select(event.target).select(function(){
                            return this.closest("td");
                          }).style("background-color", "lightgray");
                        })
                        .on("mouseout", (event) => {
                          let currentTD = d3.select(event.target).select(function(){
                            return this.closest("td");
                          })
                          let rowData = d3.select(currentTD.node().parentNode).datum() as plotData;
                          currentTD.style("background-color", rowData.aesthetics?.["table_body_bg_colour"] ?? "inherit");
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

function drawOuterBorder(selection: divBaseType, tableSettings: defaultSettingsType["summary_table"]) {
  selection.select(".table-group")
            .style("border-width", `${tableSettings.table_outer_border_width}px`)
            .style("border-style", tableSettings.table_outer_border_style)
            .style("border-color", tableSettings.table_outer_border_colour);

  ["top", "right", "bottom", "left"].forEach((side) => {
    if (!tableSettings[`table_outer_border_${side}`]) {
      selection.select(".table-group").style(`border-${side}`, "none");
    }
  });

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
                        inputSettings: defaultSettingsType, showGrouped: boolean) {
  const tableCells = selection.select(".table-body")
            .selectAll('tr')
            .selectAll('td')
            .data((d: plotData) => cols.map(col => {
              return { column: col.name, value: d.table_row[col.name] }
            }))
            .join('td');

  const draw_icons: boolean = inputSettings.nhs_icons.show_variation_icons || inputSettings.nhs_icons.show_assurance_icons;
  const thisSelDims = (tableCells.node() as SVGGElement).getBoundingClientRect()

  tableCells.each(function(d) {
    const currNode = d3.select(this);
    const parentNode = d3.select(currNode.property("parentNode"));
    const rowData = parentNode.datum() as plotData;
    if (showGrouped && draw_icons && (d.column === "variation" || d.column === "assurance")) {
      // Only attempt to draw icon if one is specified
      if (d.value !== "none") {
        const scaling = inputSettings.nhs_icons[`${d.column}_icons_scaling`];
        currNode
            .append("svg")
            .attr("width", `${thisSelDims.width * 0.5 * scaling}px`)
            .attr("viewBox", "0 0 378 378")
            .classed("rowsvg", true)
            .call(initialiseIconSVG, d.value)
            .selectAll(".icongroup")
            .selectAll(`.${d.value}`)
            .call(nhsIcons[d.value]);
      }
    } else {
      const value: string = typeof d.value === "number"
        ? d.value.toFixed(inputSettings.spc.sig_figs)
        : d.value;

      currNode.text(value).classed("cell-text", true);
    }
    const tableAesthetics: defaultSettingsType["summary_table"]
      = rowData.aesthetics?.["table_body_bg_colour"]
                              ? rowData.aesthetics as any
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

  let plotPoints: plotData[] | plotDataGrouped[];
  let cols: { name: string; label: string; }[];

  if (visualObj.viewModel.showGrouped){
    // Flatten all indicators for table display
    plotPoints = visualObj.viewModel.plotPoints.flat() as plotDataGrouped[];
    cols = visualObj.viewModel.tableColumns[0]; // Same columns for all
  } else {
    plotPoints = visualObj.viewModel.plotPoints[0] as plotData[];
    cols = visualObj.viewModel.tableColumns[0];
  }

  const maxWidth: number = visualObj.viewModel.svgWidth / cols.length;
  const tableSettings = visualObj.viewModel.inputSettings.settings[0].summary_table;

  selection.call(drawTableHeaders, cols, tableSettings, maxWidth)
            .call(drawTableRows, visualObj, plotPoints, tableSettings, maxWidth);

  if (plotPoints.length > 0) {
    selection.call(drawTableCells, cols, visualObj.viewModel.inputSettings.settings[0], visualObj.viewModel.showGrouped)
  }

  selection.call(drawOuterBorder, tableSettings);

  selection.on('click', () => {
    visualObj.selectionManager.clear();
    visualObj.updateHighlighting();
  });
}
