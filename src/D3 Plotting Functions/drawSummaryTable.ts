import { plotData, type plotDataGrouped } from "../Classes/viewModelClass";
import type { divBaseType, Visual } from "../visual";
import initialiseIconSVG from "./initialiseIconSVG";
import * as nhsIcons from "./NHS Icons"
import * as d3 from "./D3 Modules";

export default function drawSummaryTable(selection: divBaseType, visualObj: Visual) {
  selection.style("height", "100%").style("width", "100%");
  selection.selectAll(".iconrow").remove();
  selection.selectAll(".rowsvg").remove();

  if (selection.select(".table-group").empty()) {
    const table = selection.append("table")
                            .classed("table-group", true)
                            .style("border-collapse", "collapse")
                            .style("border", "2px black solid")
                            .style("width", "100%")
                            .style("height", "100%");

    table.append("thead").append("tr").classed("table-header", true);
    table.append('tbody').classed("table-body", true);
  }

  let plotPoints: plotData[] | plotDataGrouped[];
  let cols: { name: string; label: string; }[];

  if (visualObj.viewModel.showGrouped){
    plotPoints = visualObj.viewModel.plotPointsGrouped;
    cols = visualObj.viewModel.tableColumnsGrouped
                              .concat({name: "variation", label: "Variation"})
                              .concat({name: "assurance", label: "Assurance"});
  }

  selection.select(".table-header")
            .selectAll("th")
            .data(cols)
            .join("th")
            .text((d) => d.label)
            .style("border", "1px black solid")
            .style("padding", "5px")
            .style("background-color", "lightgray")
            .style("font-weight", "bold")
            .style("text-transform", "uppercase");

  const tableSelect = selection.select(".table-body")
            .selectAll('tr')
            .data(<plotData[]>plotPoints)
            .join('tr')
            /*
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
              */
            .selectAll('td')
            .data((d) => cols.map(col => d.table_row[col.name]))
            .join('td')
            .on("mouseover", (event) => {
              d3.select(event.target).style("background-color", "lightgray");
            })
            .on("mouseout", (event) => {
              d3.select(event.target).style("background-color", "white");
            })
            .style("border", "1px black solid")
            .style("padding", "5px")
            .style("font-size", "12px")

   tableSelect.filter((_, i) => i < (cols.length - 2))
              .text((d) => {
      return typeof d === "number" ? d.toFixed(visualObj.viewModel.inputSettings.settings.spc.sig_figs) : d;
    })

  //const nhsIconSettings = visualObj.viewModel.inputSettings.settings.nhs_icons;
  //const variation_location: string = nhsIconSettings.variation_icons_locations;

  const varSelection = tableSelect.filter((_, i) => i === (cols.length - 1))
  const selHeight = (varSelection.node() as SVGGElement).getBoundingClientRect()
  const svg_width: number = selHeight.width
  const svg_height: number = selHeight.height
  console.log(visualObj.viewModel.plotProperties.height)
  console.log(visualObj.viewModel.plotProperties.width)
  console.log(selHeight)

  const cellSVG = varSelection.append("svg")
                              .attr("width", svg_width * 0.8)
                              .attr("height", svg_height * 0.8)
                              .classed("rowsvg", true)

  const scaling = visualObj.viewModel.inputSettings.settings.nhs_icons.variation_icons_scaling
  //const scaling_factor: number = (0.08 * (svg_height / 378)) * scaling
  cellSVG.call(initialiseIconSVG, "commonCause")
          .selectAll(".icongroup")
          .selectAll(".commonCause")
          .attr("transform", `scale(${0.1 * scaling}) translate(0, ${ ((svg_height * 0.8) / 2) + 179 })`)
          .call(nhsIcons.commonCause)

  console.log(selection)
  console.log(varSelection)
  //console.log(varSelection.enter())



  selection.on('click', () => {
    visualObj.selectionManager.clear();
    visualObj.updateHighlighting();
  });
}
