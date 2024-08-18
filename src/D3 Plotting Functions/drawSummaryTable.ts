import { plotData, type plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, Visual } from "../visual";
import initialiseIconSVG from "./initialiseIconSVG";
import * as nhsIcons from "./NHS Icons"
import * as d3 from "./D3 Modules";
import type { defaultSettingsType } from "../Classes";
import { isNullOrUndefined } from "../Functions";

// ESLint errors due to number of lines in function
// Will refactor in future
/* eslint-disable */
export default function drawSummaryTable(selection: divBaseType, visualObj: Visual) {
  selection.style("height", "100%").style("width", "100%");
  selection.selectAll(".iconrow").remove();
  selection.selectAll(".cell-text").remove();

  if (selection.select(".table-group").empty()) {
    const table = selection.append("table")
                            .classed("table-group", true)
                            .style("border-collapse", "collapse")
                            .style("width", "100%")
                            .style("height", "100%");

    table.append("thead").append("tr").classed("table-header", true);
    table.append('tbody').classed("table-body", true);
  }

  let plotPoints: plotData[] | plotDataGrouped[];
  let cols: { name: string; label: string; }[];

  if (visualObj.viewModel.showGrouped){
    plotPoints = visualObj.viewModel.plotPointsGrouped;
    cols = visualObj.viewModel.tableColumnsGrouped;
  } else {
    plotPoints = visualObj.viewModel.plotPoints;
    cols = visualObj.viewModel.tableColumns;
  }

  const maxWidth: number = visualObj.viewModel.svgWidth / cols.length;
  const tableSettings = visualObj.viewModel.inputSettings.settings.summary_table;

  selection.select(".table-group")
            .style("border-width", `${tableSettings.table_outer_border_width}px`)
            .style("border-style", tableSettings.table_outer_border_style)
            .style("border-color", tableSettings.table_outer_border_colour);

  ["top", "right", "bottom", "left"].forEach((side) => {
    if (!tableSettings[`table_outer_border_${side}`]) {
      selection.select(".table-group").style(`border-${side}`, "none");
    }
  });

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

  selection.selectAll("first-child")
            .style("border-left", "inherit");
  selection.selectAll("th:last-child")
            .style("border-right", "inherit");

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

  const tableRows = selection.select(".table-body")
            .selectAll('tr')
            .data(<plotData[]>plotPoints)
            .join('tr')
            .on("click", (event, d: plotData) => {
              if (visualObj.host.hostCapabilities.allowInteractions) {
                visualObj.selectionManager
                          .select(d.identity, event.ctrlKey || event.metaKey)
                          .then(() =>{
                            visualObj.updateHighlighting()
                          });
                event.stopPropagation();
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

  const tableSelect = tableRows.selectAll('td')
                              .data((d) => cols.map(col => {
                                return { column: col.name, value: d.table_row[col.name] }
                              }))
                              .join('td');

  const nhsIconSettings = visualObj.viewModel.inputSettings.settings.nhs_icons;
  const draw_icons: boolean = nhsIconSettings.show_variation_icons || nhsIconSettings.show_assurance_icons;
  const showGrouped: boolean = visualObj.viewModel.showGrouped;
  const thisSelDims = (tableSelect.node() as SVGGElement).getBoundingClientRect()
  const scaling = visualObj.viewModel.inputSettings.settings.nhs_icons.variation_icons_scaling

  const icon_x: number = (thisSelDims.width * 0.8) / 0.08 / 2 - 189;
  const icon_y: number = (thisSelDims.height * 0.8) / 0.08 / 2 - 189;

  tableSelect.each(function(d, idx) {
    const currNode = d3.select(this);
    const parentNode = d3.select(currNode.property("parentNode"));
    const rowData = parentNode.datum() as plotData;
    if (showGrouped && draw_icons && (d.column === "variation" || d.column === "assurance")) {
      currNode
          .append("svg")
          .attr("width", thisSelDims.width * 0.8)
          .attr("height", thisSelDims.height * 0.8)
          .classed("rowsvg", true)
          .call(initialiseIconSVG, d.value)
          .selectAll(".icongroup")
          .attr("viewBox", "0 0 378 378")
          .selectAll(`.${d.value}`)
          .attr("transform", `scale(${0.08 * scaling}) translate(${icon_x}, ${icon_y})`)
          .call(nhsIcons[d.value]);
    } else {
      const value: string = typeof d.value === "number"
        ? d.value.toFixed(visualObj.viewModel.inputSettings.settings.spc.sig_figs)
        : d.value;

      currNode.text(value).classed("cell-text", true);
    }
    const tableAesthetics: defaultSettingsType["summary_table"]
      = rowData.aesthetics?.["table_body_bg_colour"]
                              ? rowData.aesthetics as any
                              : tableSettings;

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

    if (idx === 0) {
      currNode.style("border-left", "inherit");
    } else if (idx === cols.length - 1) {
      currNode.style("border-right", "inherit");
    }

    if (isNullOrUndefined(parentNode.property("nextElementSibling"))) {
      currNode.style("border-bottom", "inherit");
    }
    if (isNullOrUndefined(parentNode.property("previousElementSibling"))) {
      currNode.style("border-top", "inherit");
    }

    currNode.on("mouseover", (event) => {
      d3.select(event.target).select(function(){
        return this.closest("td");
      }).style("background-color", "lightgray");
    })
    .on("mouseout", (event) => {
      d3.select(event.target).select(function(){
        return this.closest("td");
      }).style("background-color", "inherit");
    });
  });

  selection.on('click', () => {
    visualObj.selectionManager.clear();
    visualObj.updateHighlighting();
  });
}
/* eslint-enable */
