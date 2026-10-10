import type { svgBaseType, Visual } from "../visual";
import lineKeys from "../Functions/lineKeys";
import { lineLabel, lineSetting } from "powerbi-visuals-core/settings";
import { drawLineLabels, inPlot, type LineLabel } from "powerbi-visuals-core/rendering";

/** Lower boundary lines place outside labels below the line */
const lowerLines = new Set(["ll99", "ll95", "ll68", "speclimits_lower"]);

/** Selects which line ends are labelled; Core places and draws them */
export default function drawLabels(selection: svgBaseType, visualObj: Visual) {
  const group = selection.select<SVGGElement>(".linesgroup").node();
  if (group === null) {
    return;
  }
  const lines = visualObj.viewModel.groupedLines;
  if (lines.length === 0) {
    drawLineLabels(group, []);
    return;
  }
  const inputSettings = visualObj.viewModel.inputSettings;
  const lineSettings = inputSettings.settings[0].lines;
  const rebaselinePoints = visualObj.viewModel.rebaselineEnds;
  const lastIndex = rebaselinePoints[rebaselinePoints.length - 1];
  const formatValue = inputSettings.derivedSettings[0].formatValue;
  const frame = visualObj.plotProperties;
  const labels: LineLabel[] = [];
  for (let r = 0; r < rebaselinePoints.length; r++) {
    const index = rebaselinePoints[r];
    const start = r === 0 ? 0 : rebaselinePoints[r - 1] + 1;
    for (let l = 0; l < lines.length; l++) {
      const name = lines[l][0];
      const points = lines[l][1];
      const key = lineKeys[name];
      const showN = rebaselinePoints.length - Math.min(rebaselinePoints.length, lineSetting<number>(lineSettings, "plot_label_show_n", key));
      const eligible = r >= showN || lineSetting<boolean>(lineSettings, "plot_label_show_all", key) || index === lastIndex;
      if (!eligible || !lineSetting<boolean>(lineSettings, "plot_label_show", key)) {
        continue;
      }
      // The period's last point inside the axis limits
      for (let i = index; i >= start; i--) {
        const value = points[i].line_value;
        if (value !== undefined && inPlot(frame, points[i].x, value)) {
          labels.push(lineLabel(lineSettings, key, {
            x: frame.xScale(points[i].x),
            y: frame.yScale(value),
            value
          }, lowerLines.has(name), formatValue));
          break;
        }
      }
    }
  }
  drawLineLabels(group, labels);
}
