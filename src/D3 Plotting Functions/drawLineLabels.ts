import type { svgBaseType, Visual } from "../visual";
import lineKeys from "../Functions/lineKeys";
import { lineLabel, lineSetting } from "powerbi-visuals-core/settings";
import { drawLineLabels, type LineLabel } from "powerbi-visuals-core/rendering";

// Lower boundary lines place outside labels below the line (finding 18)
const lowerLines = new Set(["ll99", "ll95", "ll68", "speclimits_lower"]);

// Selects which line ends are labelled; Core places and draws them
export default function drawLabels(selection: svgBaseType, visualObj: Visual) {
  const group = selection.select<SVGGElement>(".linesgroup").node();
  if (group === null) return;
  const lines = visualObj.viewModel.groupedLines;
  if (lines.length === 0) {
    drawLineLabels(group, []);
    return;
  }
  const inputSettings = visualObj.viewModel.inputSettings;
  const lineSettings = inputSettings.settings[0].lines;
  const firstLine = lines[0][1];
  // Each gap marker starts a new segment, so the point before it ends the previous one (finding 37)
  const rebaselinePoints: number[] = [];
  for (let i = 0; i < firstLine.length; i++) {
    if (firstLine[i].line_value === undefined) rebaselinePoints.push(i - 1);
  }
  rebaselinePoints.push(firstLine.length - 1);
  const lastIndex = firstLine.length - 1;
  const formatValue = inputSettings.derivedSettings[0].formatValue;
  const frame = visualObj.plotProperties;
  const labels: LineLabel[] = [];
  for (let r = 0; r < rebaselinePoints.length; r++) {
    const index = rebaselinePoints[r];
    for (let l = 0; l < lines.length; l++) {
      const [name, points] = lines[l];
      const key = lineKeys[name];
      const showN = rebaselinePoints.length - Math.min(rebaselinePoints.length, lineSetting<number>(lineSettings, "plot_label_show_n", key));
      const eligible = r >= showN || lineSetting<boolean>(lineSettings, "plot_label_show_all", key) || index === lastIndex;
      if (!eligible || !lineSetting<boolean>(lineSettings, "plot_label_show", key)) continue;
      const point = points[index];
      const value = point.line_value as number;
      labels.push(lineLabel(lineSettings, key, { x: frame.xScale(point.x), y: frame.yScale(value), value }, lowerLines.has(name), formatValue));
    }
  }
  drawLineLabels(group, labels);
}
