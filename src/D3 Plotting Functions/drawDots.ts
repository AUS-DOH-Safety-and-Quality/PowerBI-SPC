import type { plotData } from "../Classes";
import { between, isNullOrUndefined } from "../Functions";
import type { svgBaseType, Visual } from "../visual";
import * as d3 from "./D3 Modules"

export default function drawDots(selection: svgBaseType, visualObj: Visual) {
  const ylower: number = visualObj.plotProperties.yAxis.lower;
  const yupper: number = visualObj.plotProperties.yAxis.upper;
  const xlower: number = visualObj.plotProperties.xAxis.lower;
  const xupper: number = visualObj.plotProperties.xAxis.upper;
  selection
      .select(".dotsgroup")
      .selectAll("path")
      .data(visualObj.viewModel.plotPoints[0] as plotData[])
      .join("path")
      .filter((d: plotData) => !isNullOrUndefined(d.value))
      .attr("d", (d: plotData) => {
        const shape: string = d.aesthetics.shape;
        const size: number = d.aesthetics.size;
        // d3.symbol() takes size as area instead of radius
        return d3.symbol().type(d3[`symbol${shape}`]).size((size*size) * Math.PI)()
      })
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
