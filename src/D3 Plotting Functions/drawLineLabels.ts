import type { svgBaseType, Visual } from "../visual";
import { lineNameMap } from "../Functions/getAesthetic";
import type { settingsValueType } from "../settings";
import { drawLineLabels, type LineLabel, type LineLabelPosition } from "powerbi-visuals-core/rendering";

type LineSettingsKey = keyof settingsValueType["lines"];
// Lower boundary lines place outside labels below the line (finding 18)
const lowerLines = new Set(["ll99", "ll95", "ll68", "speclimits_lower"]);

function lineSetting<T>(lineSettings: settingsValueType["lines"], name: string): T {
  return lineSettings[name as LineSettingsKey] as T;
}

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
  const labels: LineLabel[] = [];
  for (let r = 0; r < rebaselinePoints.length; r++) {
    const index = rebaselinePoints[r];
    for (let l = 0; l < lines.length; l++) {
      const [name, points] = lines[l];
      const key = lineNameMap[name];
      const showN = rebaselinePoints.length - Math.min(rebaselinePoints.length, lineSetting<number>(lineSettings, `plot_label_show_n_${key}`));
      const eligible = r >= showN || lineSetting<boolean>(lineSettings, `plot_label_show_all_${key}`) || index === lastIndex;
      if (!eligible || !lineSetting<boolean>(lineSettings, `plot_label_show_${key}`)) continue;
      const point = points[index];
      labels.push({
        text: lineSetting<string>(lineSettings, `plot_label_prefix_${key}`) + formatValue(point.line_value, "value"),
        x: visualObj.plotProperties.xScale(point.x),
        y: visualObj.plotProperties.yScale(point.line_value as number),
        position: lineSetting<LineLabelPosition>(lineSettings, `plot_label_position_${key}`),
        lower: lowerLines.has(name),
        hpad: lineSetting<number>(lineSettings, `plot_label_hpad_${key}`),
        vpad: lineSetting<number>(lineSettings, `plot_label_vpad_${key}`),
        lineWidth: lineSetting<number>(lineSettings, `width_${key}`),
        size: lineSetting<number>(lineSettings, `plot_label_size_${key}`),
        font: lineSetting<string>(lineSettings, `plot_label_font_${key}`),
        colour: lineSetting<string>(lineSettings, `plot_label_colour_${key}`)
      });
    }
  }
  drawLineLabels(group, labels);
}
