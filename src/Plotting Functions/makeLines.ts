import powerbi from "powerbi-visuals-api";
import ITooltipService = powerbi.extensibility.ITooltipService;
import * as d3 from "d3";
import highlightIfSelected from "../Selection Helpers/highlightIfSelected";
import { ViewModel, PlotData, groupedData } from "../../src/Interfaces"
type LineType = d3.Selection<d3.BaseType, PlotData[], SVGElement, any>;
type MergedLineType = d3.Selection<SVGPathElement, PlotData[], SVGElement, any>;

/**
 * Function for plotting the control limit and target lines, as well
 *   as managing the creation & updating of tooltips.
 * 
 * @param MergedLineObject       - Base object to render line to
 * @param x_scale          - d3 scale function for translating axis coordinates to screen coordinates
 * @param y_scale          - d3 scale function for translating axis coordinates to screen coordinates
 * @param linetype         - Whether a control limit (either 95% or 99.8%) or a target line is requested
 * @param viewModel        - Reference to object containing the user-provided data
 * @param tooltipService   - Object managing the display and updating of tooltips
 * Optional:
 * @param x_scale_inv      - d3 scale function for translating screen coordinates to axis coordinates
 * @param y_scale_inv      - d3 scale function for translating screen coordinates to axis coordinates
 */
function makeLines(LineObject: any,
                   settings: any,
                   x_scale: d3.ScaleLinear<number, number, never>,
                   y_scale: d3.ScaleLinear<number, number, never>,
                   viewModel: ViewModel,
                   highlights: boolean) {
    let l99_width: number = settings.lines.width_99.value;
    let l95_width: number = settings.lines.width_95.value;
    let main_width: number = settings.lines.width_main.value;
    let target_width: number = settings.lines.width_target.value;
    let l99_colour: string = settings.lines.colour_99.value;
    let l95_colour: string = settings.lines.colour_95.value;
    let main_colour: string = settings.lines.colour_main.value;
    let target_colour: string = settings.lines.colour_target.value;
    
    let GroupedLines = viewModel.groupedLines;
    let group_keys: string[] = GroupedLines.map(d => d.key)

    let line_color = d3.scaleOrdinal()
                       .domain(group_keys)
                       .range([l99_colour, l95_colour, l95_colour, l99_colour, target_colour, main_colour]);

    let line_width = d3.scaleOrdinal()
                       .domain(group_keys)
                       .range([l99_width, l95_width, l95_width, l99_width, target_width, main_width]);
    
    const lineMerged = LineObject.enter()
                                 .append("path")
                                 .merge(<any>LineObject);
    lineMerged.classed('line', true);                              
    lineMerged.attr("d", d => {
                        return d3.line<groupedData>()
                            .x(d => x_scale(d.x))
                            .y(d => y_scale(d.value))
                            .defined(function(d) {return d.value !== null})
                            (d.values)
                    })
                    .attr("fill", "none")
                    .attr("stroke", d => <string>line_color(d.key))
                    .attr("stroke-width", d => <number>line_width(d.key));
    
    return lineMerged;
}

export default makeLines;
