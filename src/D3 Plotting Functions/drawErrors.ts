import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import type { svgBaseType } from "../visual";
import { drawErrorMessage, type ErrorKind } from "powerbi-visuals-core/rendering";
import type { ColourPalette } from "powerbi-visuals-core/powerbi";
import initialiseSVG from "./initialiseSVG";

export default function drawErrors(selection: svgBaseType, options: VisualUpdateOptions,
                                    colourPalette: ColourPalette, message: string, kind: ErrorKind | undefined) {
  selection.call(initialiseSVG, true);
  const svg = selection.node();
  if (svg === null) return;
  drawErrorMessage(svg, {
    width: options.viewport.width, height: options.viewport.height,
    message, kind, colour: colourPalette.foregroundColour
  });
}
