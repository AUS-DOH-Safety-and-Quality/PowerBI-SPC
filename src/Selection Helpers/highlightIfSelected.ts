import checkIDSelected from "./checkIDSelected";
import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/**
 * Function to update opacity of dots if selected in other plots,
 *     or in the current plot
 * 
 * @param DotObject     - Base dot object to add style attributes to
 * @param selectionIds  - List of current selection ids returned for getSelectionIds
 * @returns 
 */
function highlightIfSelected(DotObject: d3.Selection<any, any, any, any>,
                             LineObject: d3.Selection<any, any, any, any>,
                             selectionIds: ISelectionId[],
                             opacitySelected: number,
                             opacityUnselected: number) {
    if (!DotObject || !selectionIds) {
        return;
    }

    if (!selectionIds.length) {
        DotObject.style("fill-opacity", opacitySelected);
        LineObject.style("stroke-opacity", opacitySelected);
        return;
    }

    DotObject.each(d => {
        const opacity: number
            = checkIDSelected(selectionIds, d.identity) ? opacitySelected : opacityUnselected;

        (<any>d3).select(DotObject)
                 .style("fill-opacity", opacity);
        
        (<any>d3).select(LineObject)
                 .style("stroke-opacity", opacityUnselected)
    });
}

export default highlightIfSelected;