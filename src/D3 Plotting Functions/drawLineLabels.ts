import type { svgBaseType, Visual } from "../visual";
import { lineNameMap } from "../Functions/getAesthetic";
import { valueFormatter } from "../Functions";

export default function drawLineLabels(selection: svgBaseType, visualObj: Visual) {
  const lineSettings = visualObj.viewModel.inputSettings.settings.lines;
  const formatValue = valueFormatter(visualObj.viewModel.inputSettings.settings, visualObj.viewModel.inputSettings.derivedSettings);
  selection
    .select(".linesgroup")
    .selectAll("text")
    .data(visualObj.viewModel.groupedLines)
    .join("text")
    .text(d => {
      return lineSettings[`plot_label_show_${lineNameMap[d[0]]}`]
              ? formatValue(d[1][d[1].length - 1].line_value, "value")
              : "";
    })
    .attr("x", d => visualObj.viewModel.plotProperties.xScale(d[1][d[1].length - 1].x))
    .attr("y", d => visualObj.viewModel.plotProperties.yScale(d[1][d[1].length - 1].line_value))
    .attr("fill", "black")
    .attr("font-size", "12px")
    .attr("font-family", "Arial")
    .attr("dx", "5px")
    .attr("dy", "5px");
}
