import type { svgBaseType, Visual } from "../visual";
import { lineNameMap } from "../Functions/getAesthetic";
import { valueFormatter } from "../Functions";
import * as d3 from "./D3 Modules";

const positionOffsetMap: Record<string, number> = {
  "above": -1,
  "below": 1,
  "beside": -1
}

const outsideMap: Record<string, string> = {
  "ll99" : "below",
  "ll95" : "below",
  "ll68" : "below",
  "ul68" : "above",
  "ul95" : "above",
  "ul99" : "above",
  "speclimits_lower" : "below",
  "speclimits_upper" : "above"
}

const insideMap: Record<string, string> = {
  "ll99" : "above",
  "ll95" : "above",
  "ll68" : "above",
  "ul68" : "below",
  "ul95" : "below",
  "ul99" : "below",
  "speclimits_lower" : "above",
  "speclimits_upper" : "below"
}

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
              ? lineSettings[`plot_label_prefix_${lineNameMap[d[0]]}`] + formatValue(d[1][d[1].length - 1].line_value, "value")
              : "";
    })
    .attr("x", d => visualObj.viewModel.plotProperties.xScale(d[1][d[1].length - 1].x))
    .attr("y", d => visualObj.viewModel.plotProperties.yScale(d[1][d[1].length - 1].line_value))
    .attr("fill", d => lineSettings[`plot_label_colour_${lineNameMap[d[0]]}`])
    .attr("font-size", d => `${lineSettings[`plot_label_size_${lineNameMap[d[0]]}`]}px`)
    .attr("font-family", d => lineSettings[`plot_label_font_${lineNameMap[d[0]]}`])
    .attr("text-anchor", d => lineSettings[`plot_label_position_${lineNameMap[d[0]]}`] === "beside" ? "start" : "end")
    .attr("dx", d => {
      const offset = (lineSettings[`plot_label_position_${lineNameMap[d[0]]}`] === "beside" ? 1 : -1) * lineSettings[`plot_label_hpad_${lineNameMap[d[0]]}`];
      return `${offset}px`;
    })
    .attr("dy", function(d) {
      const bounds = (d3.select(this).node() as SVGGraphicsElement).getBoundingClientRect() as DOMRect;
      let position: string = lineSettings[`plot_label_position_${lineNameMap[d[0]]}`];
      let vpadding: number = lineSettings[`plot_label_vpad_${lineNameMap[d[0]]}`];
      if (["outside", "inside"].includes(position)) {
        position = position === "outside" ? outsideMap[d[0]] : insideMap[d[0]];
      }
      const heightMap: Record<string, number> = {
        "above": -lineSettings[`width_${lineNameMap[d[0]]}`],
        "below": lineSettings[`plot_label_size_${lineNameMap[d[0]]}`],
        "beside": bounds.height / 4
      }
      return `${positionOffsetMap[position] * vpadding + heightMap[position]}px`;
    });
}
