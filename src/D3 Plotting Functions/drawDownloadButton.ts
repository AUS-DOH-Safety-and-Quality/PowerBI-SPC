import type { plotData } from "../Classes/viewModelClass";
import type { svgBaseType, Visual } from "../visual";
import { toCsv } from "powerbi-visuals-core/data";
import { drawDownloadButton } from "powerbi-visuals-core/rendering";

export default function drawDownload(selection: svgBaseType, visualObj: Visual): void {
  const svg = selection.node();
  if (svg === null) {
    return;
  }
  const viewModel = visualObj.viewModel;
  drawDownloadButton(svg, {
    visible: viewModel.inputSettings.settings[0].download_options.show_button,
    x: viewModel.svgWidth - 50,
    y: viewModel.svgHeight - 5,
    onClick: () => {
      const points = viewModel.plotPoints[0] as plotData[];
      const rows = new Array<plotData["table_row"]>(points.length);
      for (let i = 0; i < points.length; i++) {
        rows[i] = points[i].table_row;
      }
      visualObj.host.downloadService.exportVisualsContent(toCsv(rows), "chartdata.csv", "csv", "csv file");
    }
  });
}
