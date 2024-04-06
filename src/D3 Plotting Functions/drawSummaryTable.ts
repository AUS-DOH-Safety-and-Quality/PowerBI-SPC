import { plotData } from "../Classes/viewModelClass";
import type { divBaseType, Visual } from "../visual";

export default function drawSummaryTable(selection: divBaseType, visualObj: Visual) {
  selection.select("svg").attr("width", 0).attr("height", 0);

  if (selection.select(".table-group").empty()) {
    const table = selection.append("table").classed("table-group", true);
    table.append("thead")
          .append("tr")
          .classed("table-header", true);
    table.append('tbody')
          .classed("table-body", true);
  }

  const plotPoints: plotData[] = visualObj.viewModel.plotPoints;

  selection.select(".table-header")
            .selectAll("th")
            .data(Object.keys(plotPoints[0].table_row))
            .join("th")
            .text((d) => d);

  selection.select(".table-body")
            .selectAll('tr')
            .data(plotPoints)
            .join('tr')
            .selectAll('td')
            .data((d) => Object.values(d.table_row))
            .join('td')
            .text((d) => d);
}
