import viewModelClass from "../Classes/viewModelClass";
import { plotData } from "../Classes/viewModelClass";
import between from "../Functions/between";
import { svgBaseType, Visual } from "../visual";

export default function drawDots(selection: svgBaseType, visualObj: Visual) {
  selection.selectAll(".dotsgroup").remove()
  if (!(visualObj.viewModel.plotProperties.displayPlot)) {
    return;
  }
  const lower: number = visualObj.viewModel.plotProperties.yAxis.lower;
  const upper: number = visualObj.viewModel.plotProperties.yAxis.upper;

  selection
      .append('g')
      .classed("dotsgroup", true)
      .selectAll(".dotsgroup")
      .data(visualObj.viewModel.plotPoints)
      .enter()
      .append("circle")
      .filter((d: plotData) => d.value !== null)
      .attr("cy", (d: plotData) => visualObj.viewModel.plotProperties.yScale(d.value))
      .attr("cx", (d: plotData) =>visualObj.viewModel.plotProperties.xScale(d.x))
      .attr("r", (d: plotData) => d.aesthetics.size)
      .style("fill", (d: plotData) => {
        return between(d.value, lower, upper) ? d.aesthetics.colour : "#FFFFFF";
      })
      .on("click", (event, d: plotData) => {
          if (visualObj.viewModel.inputSettings.spc.split_on_click) {
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
                .then(() => { visualObj.updateHighlighting(); });
          }
          event.stopPropagation();
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
      visualObj.updateHighlighting()
    });
}
