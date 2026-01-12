import { summaryTableRowData, plotData } from "../Classes/viewModelClass";
import type { svgBaseType, Visual } from "../visual";

export default function drawDownloadButton(selection: svgBaseType, visualObj: Visual) {
  if (!(visualObj.viewModel.inputSettings.settings[0].download_options.show_button)) {
    selection.select(".download-btn-group").remove();
    return;
  }
  if (selection.select(".download-btn-group").empty()) {
    selection.append("text").classed("download-btn-group", true);
  }
  const table_rows: summaryTableRowData[] = (visualObj.viewModel.plotPoints[0] as plotData[]).map(d => d.table_row);
  const csv_rows: string[] = new Array<string>();
  csv_rows.push(Object.keys(table_rows[0]).join(","));
  table_rows.forEach(row => {
    csv_rows.push(Object.values(row).join(","));
  });
  selection.select(".download-btn-group")
            .attr("x", visualObj.viewModel.svgWidth - 50)
            .attr("y", visualObj.viewModel.svgHeight - 5)
            .text("Download")
            .style("font-size", "10px")
            .style("text-decoration", "underline")
            .on("click", () => {
              visualObj.host.downloadService
                       .exportVisualsContent(csv_rows.join("\n"),
                                              "chartdata.csv", "csv", "csv file");
            })
}
