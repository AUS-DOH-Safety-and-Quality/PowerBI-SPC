import type { svgBaseType, Visual } from "../visual";
import { lineNameMap } from "../Functions/getAesthetic";
import valueFormatter from "../Functions/valueFormatter";
import * as d3 from "./D3 Modules";
import type { lineData } from "../Classes/viewModelClass";
import { type settingsValueType } from "../settings";

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

interface lineLabelType {
  index: number;
  limit: number;
}

type LineSettingsKey = keyof settingsValueType["lines"];

export default function drawLineLabels(selection: svgBaseType, visualObj: Visual) {
  if (visualObj.viewModel.groupedLines.length === 0) {
    // No lines being rendered, so remove any existing labels and return early
    selection
      .select(".linesgroup")
      .selectAll("text")
      .data([])
      .join("text")
      .remove();
    return;
  }
  const lineSettings = visualObj.viewModel.inputSettings.settings[0].lines;
  const rebaselinePoints: number[] = new Array<number>();
  visualObj.viewModel.groupedLines[0][1].forEach((d: lineData, idx: number) => {
    if (d.line_value === null) {
      rebaselinePoints.push(idx - 1);
    }
    if (idx === visualObj.viewModel.groupedLines[0][1].length - 1) {
      rebaselinePoints.push(idx);
    }
  });
  const limits: string[] = visualObj.viewModel.groupedLines.map(d => d[0]);
  const labelsToPlot: lineLabelType[] = new Array<lineLabelType>();
  rebaselinePoints.forEach((d: number, rb_idx: number) => {
    limits.forEach((limit: string, idx: number) => {
      const lastIndex: number = rebaselinePoints[rebaselinePoints.length - 1];
      const showN: number = rebaselinePoints.length - Math.min(rebaselinePoints.length, lineSettings[`plot_label_show_n_${lineNameMap[limit]}` as LineSettingsKey] as number);
      const showLabel: boolean = lineSettings[`plot_label_show_all_${lineNameMap[limit]}` as LineSettingsKey] as boolean
        || (d == lastIndex);
      if (rb_idx >= showN) {
        labelsToPlot.push({index: d, limit: idx});
      } else if (showLabel) {
        labelsToPlot.push({index: d, limit: idx});
      }
    });
  });
  const formatValue = valueFormatter(visualObj.viewModel.inputSettings.settings[0], visualObj.viewModel.inputSettings.derivedSettings[0]);
  selection
    .select(".linesgroup")
    .selectAll("text")
    .data(labelsToPlot)
    .join("text")
    .text((d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      return lineSettings[`plot_label_show_${lineNameMap[lineGroup[0]]}` as LineSettingsKey]
              ? lineSettings[`plot_label_prefix_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] + formatValue(lineGroup[1][d.index].line_value, "value")
              : "";
    })
    .attr("x", (d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      return visualObj.plotProperties.xScale(lineGroup[1][d.index].x) as number
    })
    .attr("y", (d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      return visualObj.plotProperties.yScale(lineGroup[1][d.index].line_value as number) as number
    })
    .attr("fill", (d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      return lineSettings[`plot_label_colour_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] as string
    })
    .attr("font-size", (d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      return `${lineSettings[`plot_label_size_${lineNameMap[lineGroup[0]]}` as LineSettingsKey]}px`
    })
    .attr("font-family", (d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      return lineSettings[`plot_label_font_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] as string
    })
    .attr("text-anchor", (d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      return lineSettings[`plot_label_position_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] === "beside" ? "start" : "end"
    })
    .attr("dx", (d: lineLabelType) => {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      const offset = (lineSettings[`plot_label_position_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] === "beside" ? 1 : -1) * (lineSettings[`plot_label_hpad_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] as number);
      return `${offset}px`;
    })
    .attr("dy", function(d: lineLabelType) {
      const lineGroup: [string, lineData[]] = visualObj.viewModel.groupedLines[d.limit];
      const bounds = (d3.select(this).node() as SVGGraphicsElement).getBoundingClientRect() as DOMRect;
      let position: string = lineSettings[`plot_label_position_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] as string;
      const vpadding: number = lineSettings[`plot_label_vpad_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] as number;
      if (["outside", "inside"].includes(position)) {
        position = position === "outside" ? outsideMap[lineGroup[0]] : insideMap[lineGroup[0]];
      }
      const heightMap: Record<string, number> = {
        "above": -(lineSettings[`width_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] as number),
        "below": (lineSettings[`plot_label_size_${lineNameMap[lineGroup[0]]}` as LineSettingsKey] as number),
        "beside": bounds.height / 4
      }
      return `${positionOffsetMap[position] * vpadding + heightMap[position]}px`;
    });
}
