import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import type { svgBaseType } from "../visual";
import initialiseSVG from "./initialiseSVG";

export default function drawErrors(selection: svgBaseType,
                                    options: VisualUpdateOptions,
                                    message: string,
                                    internal: boolean = false) {
  selection.call(initialiseSVG, true);
  const errMessageSVG = selection.append("g").classed("errormessage", true);

  if (internal) {
    errMessageSVG.append('text')
                .attr("x",options.viewport.width / 2)
                .attr("y",options.viewport.height / 3)
                .style("text-anchor", "middle")
                .text("Internal Error! Please file a bug report with the following text:")
                .style("font-size", "10px");
  }

  errMessageSVG.append('text')
                .attr("x",options.viewport.width / 2)
                .attr("y",options.viewport.height / 2)
                .style("text-anchor", "middle")
                .text(message)
                .style("font-size", "10px");
}
