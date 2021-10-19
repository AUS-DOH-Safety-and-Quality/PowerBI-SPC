import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;
import ISelectionId = powerbi.visuals.ISelectionId;
import * as d3 from "d3";
import highlightIfSelected from "../Selection Helpers/highlightIfSelected";

/**
 * Function for rendering scatter dots on the chart, adding tooltips,
 * and managing interactivity
 * 
 * @param MergedDotObject         - Base object to render scatter points to
 * @param highlights        - Boolean indicating whether point should be highlighted
 * @param selectionManager  - PowerBI interface for managing cross-plot interactivity
 * @param tooltipService    - Object for management of tooltip rendering
 * @param x_scale           - d3 scale function for translating axis coordinates to screen coordinates
 * @param y_scale           - d3 scale function for translating axis coordinates to screen coordinates
 */
function makeDots(DotObject: d3.Selection<SVGCircleElement, any, any, any>,
                  LineObject: d3.Selection<SVGPathElement, any, any, any>,
                  settings: any,
                  highlights: boolean,
                  selectionManager: ISelectionManager,
                  tooltipService: ITooltipService,
                  x_scale: d3.ScaleLinear<number, number, never>,
                  y_scale: d3.ScaleLinear<number, number, never>,
                  svg: d3.Selection<SVGElement, any, any, any>): void {
    let dot_size: number = settings.scatter.size.value;
    let dot_colour: string = settings.scatter.colour.value;
    let dot_opacity: number = settings.scatter.opacity.value;
    let dot_opacity_unsel: number = settings.scatter.opacity_unselected.value;

    // Update the datapoints if data is refreshed
    const MergedDotObject: d3.Selection<SVGCircleElement, any, any, any>
            = DotObject.enter()
                  .append("circle")
                  .merge(<any>DotObject);

    MergedDotObject.classed("dot", true);

    MergedDotObject.filter(d => (d.ratio != null))
             .attr("cy", d => y_scale(d.ratio))
             .attr("cx", d => x_scale(d.x))
             .attr("r", dot_size)
            // Fill each dot with the colour in each DataPoint
             .style("fill", d => dot_colour);

    highlightIfSelected(MergedDotObject, LineObject, selectionManager.getSelectionIds() as ISelectionId[],
                        dot_opacity, dot_opacity_unsel);

    // Change opacity (highlighting) with selections in other plots
    // Specify actions to take when clicking on dots
    MergedDotObject
        .style("fill-opacity", d => highlights ? (d.highlighted ? dot_opacity : dot_opacity_unsel) : dot_opacity)
        .on("click", d => {
            // Pass identities of selected data back to PowerBI
            selectionManager
                // Propagate identities of selected data back to
                //   PowerBI based on all selected dots
                .select(d.identity, (<any>d3).event.ctrlKey)
                // Change opacity of non-selected dots
                .then(ids => {
                    MergedDotObject.style(
                        "fill-opacity", d => 
                        ids.length > 0 ? 
                        (ids.indexOf(d.identity) >= 0 ? dot_opacity : dot_opacity_unsel) 
                        : dot_opacity
                    );
                    LineObject.style("stroke-opacity", ids.length > 0 ? dot_opacity_unsel : dot_opacity)
                });
                (<any>d3).event.stopPropagation();
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

    MergedDotObject.exit().remove();
    DotObject.exit().remove();
    svg.on('click', (d) => {
        selectionManager.clear();
        
        highlightIfSelected(MergedDotObject, LineObject, [],
                            dot_opacity, dot_opacity_unsel);
    });
}

export default makeDots;
