import * as d3 from "d3";
import highlightIfSelected from "../Selection Helpers/highlightIfSelected";

/**
 * Function for rendering scatter dots on the chart, adding tooltips,
 * and managing interactivity
 * 
 * @param DotObject         - Base object to render scatter points to
 * @param highlights        - Boolean indicating whether point should be highlighted
 * @param selectionManager  - PowerBI interface for managing cross-plot interactivity
 * @param tooltipService    - Object for management of tooltip rendering
 * @param x_scale           - d3 scale function for translating axis coordinates to screen coordinates
 * @param y_scale           - d3 scale function for translating axis coordinates to screen coordinates
 */
function makeDots(DotObject, settings, highlights, selectionManager,
                  tooltipService, x_scale, y_scale) {
    let dot_size = settings.scatter.size.value;
    let dot_colour = settings.scatter.colour.value;
    let dot_opacity = settings.scatter.opacity.value;
    let dot_opacity_unsel = settings.scatter.opacity_unselected.value;

    DotObject.filter(d => (d.ratio != null))
             .attr("cy", d => y_scale(d.ratio))
             .attr("cx", d => x_scale(d.x))
             .attr("r", dot_size)
            // Fill each dot with the colour in each DataPoint
             .style("fill", d => dot_colour);

    highlightIfSelected(DotObject, selectionManager.getSelectionIds(),
                        dot_opacity, dot_opacity_unsel);

    // Change opacity (highlighting) with selections in other plots
    // Specify actions to take when clicking on dots
    DotObject
        .style("fill-opacity", d => highlights ? (d.highlighted ? dot_opacity : dot_opacity_unsel) : dot_opacity)
        .on("click", d => {
            // Pass identities of selected data back to PowerBI
            selectionManager
                // Propagate identities of selected data back to
                //   PowerBI based on all selected dots
                .select(d.identity, (<any>d3).event.ctrlKey)
                // Change opacity of non-selected dots
                .then(ids => {
                    DotObject.style(
                        "fill-opacity", d => 
                        ids.length > 0 ? 
                        (ids.indexOf(d.identity) >= 0 ? dot_opacity : dot_opacity_unsel) 
                        : dot_opacity
                    );
                });
         })
        // Display tooltip content on mouseover
        .on("mouseover", d => {
            // Get screen coordinates of mouse pointer, tooltip will
            //   be displayed at these coordinates
            //    Needs the '<any>' prefix, otherwise PowerBI doesn't defer
            //      to d3 properly
            let x = (<any>d3).event.pageX;
            let y = (<any>d3).event.pageY;

            tooltipService.show({
                dataItems: d.tooltips,
                identities: [d.identity],
                coordinates: [x, y],
                isTouchEvent: false
            });
        })
        // Specify that tooltips should move with the mouse
        .on("mousemove", d => {
            // Get screen coordinates of mouse pointer, tooltip will
            //   be displayed at these coordinates
            //    Needs the '<any>' prefix, otherwise PowerBI doesn't defer
            //      to d3 properly
            let x = (<any>d3).event.pageX;
            let y = (<any>d3).event.pageY;

            // Use the 'move' service for more responsive display
            tooltipService.move({
                dataItems: d.tooltips,
                identities: [d.identity],
                coordinates: [x, y],
                isTouchEvent: false
            });
        })
        // Hide tooltip when mouse moves out of dot
        .on("mouseout", d => {
            tooltipService.hide({
                immediately: true,
                isTouchEvent: false
            })
        });

    DotObject.exit().remove();
}

export default makeDots;