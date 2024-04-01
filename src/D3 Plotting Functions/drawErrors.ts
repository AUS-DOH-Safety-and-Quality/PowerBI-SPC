import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import type { svgBaseType } from "../visual";
import initialiseSVG from "./initialiseSVG";

export default function drawErrors(selection: svgBaseType,
                                    options: VisualUpdateOptions,
                                    message: string,
                                    type: string = null) {
  selection.call(initialiseSVG, true);
  const errMessageSVG = selection.append("g").classed("errormessage", true);

  if (type) {
    const preamble: Record<string, string> = {
      "internal": "Internal Error! Please file a bug report with the following text:",
      "settings": "Invalid settings provided for all observations! First error:"
    }
    errMessageSVG.append('text')
                .attr("x",options.viewport.width / 2)
                .attr("y",options.viewport.height / 3)
                .style("text-anchor", "middle")
                .text(preamble[type])
                .style("font-size", "10px");
  }

  errMessageSVG.append('text')
                .attr("x",options.viewport.width / 2)
                .attr("y",options.viewport.height / 2)
                .style("text-anchor", "middle")
                .text(message)
                .style("font-size", "10px");
}
