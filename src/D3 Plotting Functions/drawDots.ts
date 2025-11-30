import type { plotData } from "../Classes";
import { between, isNullOrUndefined } from "../Functions";
import type { svgBaseType, Visual } from "../visual";
import * as d3 from "./D3 Modules"

/**
 * Symbol path cache - stores pre-computed D3 symbol path strings
 * Key format: "shape-size" (e.g., "Circle-8")
 * 
 * Performance optimization: d3.symbol().type().size()() is expensive because it:
 * 1. Creates a new symbol generator
 * 2. Computes the path mathematically
 * 3. Generates the SVG path string
 * 
 * Since the output is deterministic (same shape + size = same path), we cache it.
 * This reduces repeated D3 symbol generation calls during rendering.
 */
const symbolPathCache = new Map<string, string>();

/**
 * Clear the symbol path cache. Useful for testing and memory management.
 * In normal operation, the cache is small (limited shape × size combinations)
 * and does not need to be cleared.
 */
export function clearSymbolPathCache(): void {
  symbolPathCache.clear();
}

/**
 * Get the current size of the symbol path cache.
 * Useful for testing and debugging.
 */
export function getSymbolPathCacheSize(): number {
  return symbolPathCache.size;
}

/**
 * Get a cached symbol path string, computing and caching it if not already present.
 * 
 * @param shape - The D3 symbol shape name (e.g., "Circle", "Cross", "Diamond")
 * @param size - The symbol size (visual radius, converted to area for D3)
 * @returns The SVG path string for the symbol
 */
export function getSymbolPath(shape: string, size: number): string {
  const key = `${shape}-${size}`;
  let pathString = symbolPathCache.get(key);
  if (pathString === undefined) {
    // d3.symbol() takes size as area instead of radius
    // Get the symbol type, falling back to Circle if not found
    const symbolType = d3[`symbol${shape}`] ?? d3.symbolCircle;
    // Generate the path string and cache it
    pathString = d3.symbol().type(symbolType).size((size * size) * Math.PI)();
    symbolPathCache.set(key, pathString);
  }
  return pathString;
}

export default function drawDots(selection: svgBaseType, visualObj: Visual) {
  const ylower: number = visualObj.plotProperties.yAxis.lower;
  const yupper: number = visualObj.plotProperties.yAxis.upper;
  const xlower: number = visualObj.plotProperties.xAxis.lower;
  const xupper: number = visualObj.plotProperties.xAxis.upper;
  selection
      .select(".dotsgroup")
      .selectAll("path")
      .data(visualObj.viewModel.plotPoints)
      .join("path")
      .filter((d: plotData) => !isNullOrUndefined(d.value))
      .attr("d", (d: plotData) => getSymbolPath(d.aesthetics.shape, d.aesthetics.size))
      .attr("transform", (d: plotData) => {
        if (!between(d.value, ylower, yupper) || !between(d.x, xlower, xupper)) {
          // If the point is outside the limits, don't draw it
          return "translate(0, 0) scale(0)";
        }
        return `translate(${visualObj.plotProperties.xScale(d.x)}, ${visualObj.plotProperties.yScale(d.value)})`
      })
      .style("fill", (d: plotData) => {
        return d.aesthetics.colour;
      })
      .style("stroke", (d: plotData) => {
        return d.aesthetics.colour_outline;
      })
      .style("stroke-width", (d: plotData) => d.aesthetics.width_outline)
      .on("click", (event, d: plotData) => {
        if (visualObj.host.hostCapabilities.allowInteractions) {
          if (visualObj.viewModel.inputSettings.settings.spc.split_on_click) {
            // Identify whether limits are already split at datapoint, and undo if so
            const xIndex: number = visualObj.viewModel.splitIndexes.indexOf(d.x)
            if (xIndex > -1) {
              visualObj.viewModel.splitIndexes.splice(xIndex, 1)
            } else {
              visualObj.viewModel.splitIndexes.push(d.x)
            }

            // Store the current limit-splitting indices to make them available between full refreshes
            // This also initiates a visual update() call, causing the limits to be re-calculated
            visualObj.host.persistProperties({
              replace: [{
                objectName: "split_indexes_storage",
                selector: undefined,
                properties: { split_indexes: JSON.stringify(visualObj.viewModel.splitIndexes) }
              }]
            });
          } else {
            // Pass identities of selected data back to PowerBI
            visualObj.selectionManager
                // Propagate identities of selected data back to
                //   PowerBI based on all selected dots
                .select(d.identity, (event.ctrlKey || event.metaKey))
                // Change opacity of non-selected dots
                .then(() => {
                  visualObj.updateHighlighting();
                });
          }
          event.stopPropagation();
        }
      })
      // Display tooltip content on mouseover
      .on("mouseover", (event, d: plotData) => {
        // Get screen coordinates of mouse pointer, tooltip will
        //   be displayed at these coordinates
        const x = event.pageX;
        const y = event.pageY;

        visualObj.host.tooltipService.show({
          dataItems: d.tooltip,
          identities: [d.identity],
          coordinates: [x, y],
          isTouchEvent: false
        });
      })
      // Hide tooltip when mouse moves out of dot
      .on("mouseout", () => {
        visualObj.host.tooltipService.hide({
          immediately: true,
          isTouchEvent: false
        })
      });

    selection.on('click', () => {
      visualObj.selectionManager.clear();
      visualObj.updateHighlighting();
    });
}
