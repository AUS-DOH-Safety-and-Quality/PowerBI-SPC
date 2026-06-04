import type { plotData } from "../Classes/viewModelClass";
import between from "../Functions/between";
import isNullOrUndefined from "../Functions/isNullOrUndefined";
import type { svgBaseType, Visual } from "../visual";
import * as d3 from "./D3 Modules"
import plotPropertiesClass from "../Classes/plotPropertiesClass";

export default function drawDots(selection: svgBaseType, visualObj: Visual) {
  const plotProperties: plotPropertiesClass = visualObj.plotProperties;
  if (!visualObj.viewModel.inputSettings.settings[0].scatter.show_dots || !plotProperties.displayPlot) {
    // Dot plotting is disabled, so remove any existing dots and return early
    selection
      .select(".dotsgroup")
      .selectAll("path")
      .data([])
      .join("path")
      .remove();
    return;
  }

  const ylower: number = plotProperties.yAxis.lower;
  const yupper: number = plotProperties.yAxis.upper;
  const xlower: number = plotProperties.xAxis.lower;
  const xupper: number = plotProperties.xAxis.upper;
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
        return d3.symbol().type(d3[`symbol${shape}` as keyof typeof d3] as d3.SymbolType).size((size*size) * Math.PI)()
      })
      .attr("transform", (d: plotData) => {
        if (!between(d.value, ylower, yupper) || !between(d.x, xlower, xupper)) {
          // If the point is outside the limits, don't draw it
          return "translate(0, 0) scale(0)";
        }
        return `translate(${plotProperties.xScale(d.x)}, ${plotProperties.yScale(d.value)})`
      })
      .style("fill", (d: plotData) => {
        return d.aesthetics.colour;
      })
      .style("stroke", (d: plotData) => {
        return d.aesthetics.colour_outline;
      })
      .style("stroke-width", (d: plotData) => d.aesthetics.width_outline)
      .on("click", (event, d: plotData) => {
        if (!plotProperties.displayPlot) {
          return;
        }
        if (visualObj.host.hostCapabilities.allowInteractions) {
          if (visualObj.viewModel.inputSettings.settings[0].spc.split_on_click) {
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
                selector: {},
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
        if (!plotProperties.displayPlot) {
          return;
        }
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
        if (!plotProperties.displayPlot) {
          return;
        }
        visualObj.host.tooltipService.hide({
          immediately: true,
          isTouchEvent: false
        })
      });

    selection.on('click', () => {
      if (!plotProperties.displayPlot) {
        return;
      }
      visualObj.selectionManager.clear();
      visualObj.updateHighlighting();
    });
}
