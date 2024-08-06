import { plotData, type plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, Visual } from "../visual";
import initialiseIconSVG from "./initialiseIconSVG";
import * as nhsIcons from "./NHS Icons"
import * as d3 from "./D3 Modules";

// ESLint errors due to number of lines in function, but would reduce readability to separate further
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

  const tableHeaders = selection.select(".table-header")
            .selectAll("th")
            .data(cols)
            .join("th")
            .style("border", "1px black solid")
            .style("padding", "1px")
            .style("background-color", tableSettings.table_header_bg_colour)
            .style("font-weight", tableSettings.table_header_font_weight)
            .style("text-transform", tableSettings.table_header_text_transform)
            .style("text-align", tableSettings.table_header_text_align)

  if (tableSettings.table_text_overflow !== "none") {
    tableHeaders.style("overflow", "hidden")
                .style("max-width", `${maxWidth}px`)
                .style("text-overflow", tableSettings.table_text_overflow);
  } else {
    tableHeaders.style("overflow", "auto")
                .style("max-width", "none")
  }

  tableHeaders.selectAll("text")
              .data(d => [d.label])
              .join("text")
              .text(d => d)
              .style("font-size", `${tableSettings.table_header_size}px`)
              .style("font-family", tableSettings.table_header_font)
              .style("color", tableSettings.table_header_colour)

  const tableRows = selection.select(".table-body")
            .selectAll('tr')
            .data(<plotData[]>plotPoints)
            .join('tr')
            .on("click", (event, d: plotData) => {
              if (visualObj.host.hostCapabilities.allowInteractions) {
                visualObj.selectionManager
                          .select(d.identity, event.ctrlKey || event.metaKey)
                          .then(() => {
                            visualObj.updateHighlighting();
                          });
                event.stopPropagation();
              }
            })
            .style("background-color", (d) => {
              const groupBGColour: string = d.aesthetics?.["table_body_bg_colour"] ?? tableSettings.table_body_bg_colour;
              return groupBGColour;
            })
            .style("font-weight", (d) => {
              const groupWeight: string = d.aesthetics?.["table_body_font_weight"] ?? tableSettings.table_body_font_weight;
              return groupWeight;
            })
            .style("text-transform", (d) => {
              const groupTransform: string = d.aesthetics?.["table_body_text_transform"] ?? tableSettings.table_body_text_transform;
              return groupTransform;
            })
            .style("text-align", (d) => {
              const groupAlign: string = d.aesthetics?.["table_body_text_align"] ?? tableSettings.table_body_text_align;
              return groupAlign;
            })
            .style("font-size", (d) => {
              const groupSize: number = d.aesthetics?.["table_body_size"] ?? tableSettings.table_body_size;
              return `${groupSize}px`;
            })
            .style("font-family", (d) => {
              const groupFont: string = d.aesthetics?.["table_body_font"] ?? tableSettings.table_body_font;
              return groupFont;
            })
            .style("color", (d) => {
              const groupColour: string = d.aesthetics?.["table_body_colour"] ?? tableSettings.table_body_colour;
              return groupColour;
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
              return {column: col.name, value: d.table_row[col.name]}
            }))
            .join('td');

  tableSelect.on("mouseover", (event) => {
              d3.select(event.target).select(function(){
                return this.closest("td");
              }).style("background-color", "lightgray");
            })
            .on("mouseout", (event) => {
              d3.select(event.target).select(function(){
                return this.closest("td");
              }).style("background-color", "inherit");
            })
            .style("border", "1px black solid")
            .style("padding", "1px")

  const nhsIconSettings = visualObj.viewModel.inputSettings.settings.nhs_icons;
  const draw_icons: boolean = nhsIconSettings.show_variation_icons || nhsIconSettings.show_assurance_icons;
  const showGrouped: boolean = visualObj.viewModel.showGrouped;
  const thisSelDims = (tableSelect.node() as SVGGElement).getBoundingClientRect()
  const scaling = visualObj.viewModel.inputSettings.settings.nhs_icons.variation_icons_scaling

  const icon_x: number = (thisSelDims.width * 0.8) / 0.08 / 2 - 189;
  const icon_y: number = (thisSelDims.height * 0.8) / 0.08 / 2 - 189;

  tableSelect.each(function(d) {
    if (showGrouped && draw_icons && (d.column === "variation" || d.column === "assurance")) {
      d3.select(this)
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

      d3.select(this).text(value).classed("cell-text", true);
    }
  })

  selection.on('click', () => {
    visualObj.selectionManager.clear();
    visualObj.updateHighlighting();
  });
}
/* eslint-enable */
