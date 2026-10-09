import type { settingsValueType } from "../settings";
import getAesthetic from "../Functions/getAesthetic";
import type { svgBaseType, Visual } from "../visual";
import { drawLines, type PlotLine } from "powerbi-visuals-core/rendering";

export default function drawPlotLines(selection: svgBaseType, visualObj: Visual) {
  const group = selection.select<SVGGElement>(".linesgroup").node();
  if (group === null) {
    return;
  }
  const grouped = visualObj.viewModel.groupedLines;
  const lines = new Array<PlotLine>(grouped.length);
  for (let i = 0; i < grouped.length; i++) {
    const [name, points] = grouped[i];
    // Each point carries its own row's line settings, so rebaselined segments may differ
    const aesthetic = (index: number, key: string) =>
      getAesthetic(name, "lines", key, { lines: points[index].aesthetics } as settingsValueType);
    lines[i] = {
      name, points,
      style: index => ({
        colour: aesthetic(index, "colour") as string,
        width: aesthetic(index, "width") as number,
        type: aesthetic(index, "type") as string
      })
    };
  }
  drawLines(group, { frame: visualObj.plotProperties, lines, palette: visualObj.viewModel.colourPalette });
}
