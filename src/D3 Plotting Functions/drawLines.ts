import * as d3 from "./D3 Modules";
import type { lineData } from "../Classes";
import { between, getAesthetic, isNullOrUndefined } from "../Functions";
import type { svgBaseType, Visual } from "../visual";

/**
 * Performance-optimized line drawing function.
 * 
 * Optimizations applied:
 * 1. Line generator is created once per render call, not per-path
 * 2. Scale references and bounds are cached outside the data binding loop
 * 3. Bounds checks are hoisted to minimize redundant property lookups
 * 4. Settings object reference is cached to avoid repeated property access
 */
export default function drawLines(selection: svgBaseType, visualObj: Visual) {
  // Cache scale functions and bounds outside the data binding loop
  // This avoids repeated property access in the per-element callbacks
  const xScale = visualObj.plotProperties.xScale;
  const yScale = visualObj.plotProperties.yScale;
  const ylower: number = visualObj.plotProperties.yAxis.lower;
  const yupper: number = visualObj.plotProperties.yAxis.upper;
  const xlower: number = visualObj.plotProperties.xAxis.lower;
  const xupper: number = visualObj.plotProperties.xAxis.upper;
  
  // Cache settings reference to avoid repeated property chain traversal
  const settings = visualObj.viewModel.inputSettings.settings;
  const colourPalette = visualObj.viewModel.colourPalette;
  const isHighContrast = colourPalette.isHighContrast;
  const foregroundColour = colourPalette.foregroundColour;
  
  // Pre-create line generator once - avoids creating a new generator per path
  // The generator is configured with cached scale functions and bounds
  const lineGenerator = d3.line<lineData>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.line_value))
    .defined(d => {
      return !isNullOrUndefined(d.line_value)
        && between(d.line_value, ylower, yupper)
        && between(d.x, xlower, xupper)
    });

  selection
      .select(".linesgroup")
      .selectAll("path")
      .data(visualObj.viewModel.groupedLines)
      .join("path")
      .attr("d", d => lineGenerator(d[1]))
      .attr("fill", "none")
      .attr("stroke", d => {
        return isHighContrast
                ? foregroundColour
                : getAesthetic(d[0], "lines", "colour", settings)
      })
      .attr("stroke-width", d => getAesthetic(d[0], "lines", "width", settings))
      .attr("stroke-dasharray", d => getAesthetic(d[0], "lines", "type", settings));
}
