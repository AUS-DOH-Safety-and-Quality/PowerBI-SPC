import type { svgBaseType } from "../visual";

export default function initialiseSVG(selection: svgBaseType,
                                      removeAll: boolean = false) {
  if (removeAll) {
    selection.selectChildren().remove();
  }
  selection.append('line').classed("ttip-line-x", true)
  selection.append('line').classed("ttip-line-y", true)
  selection.append('g').classed("xaxisgroup", true)
  selection.append('text').classed("xaxislabel", true)
  selection.append('g').classed("yaxisgroup", true)
  selection.append('text').classed("yaxislabel", true)
  selection.append('g').classed("linesgroup", true)
  selection.append('g').classed("dotsgroup", true)
}
