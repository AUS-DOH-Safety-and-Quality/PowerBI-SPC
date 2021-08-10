import * as d3 from "d3";
/**
 * Function for plotting the control limit and target lines, as well
 *   as managing the creation & updating of tooltips.
 * 
 * @param LineObject       - Base object to render line to
 * @param x_scale          - d3 scale function for translating axis coordinates to screen coordinates
 * @param y_scale          - d3 scale function for translating axis coordinates to screen coordinates
 * @param linetype         - Whether a control limit (either 95% or 99.8%) or a target line is requested
 * @param viewModel        - Reference to object containing the user-provided data
 * @param tooltipService   - Object managing the display and updating of tooltips
 * Optional:
 * @param x_scale_inv      - d3 scale function for translating screen coordinates to axis coordinates
 * @param y_scale_inv      - d3 scale function for translating screen coordinates to axis coordinates
 */
function makeLines(LineObject, settings, x_scale, y_scale,
                   linetype, viewModel, tooltipService,
                   y_scale_inv?) {
    let l99_width = settings.lines.width_99.value;
    let main_width = settings.lines.width_main.value;
    let target_width = settings.lines.width_target.value;
    let l99_colour = settings.lines.colour_99.value;
    let main_colour = settings.lines.colour_main.value;
    let target_colour = settings.lines.colour_target.value;
    if (linetype != "Target") {
        if(linetype == "Lower") {
            LineObject.attr("d", d3.line<typeof viewModel.LimitLines>()
                                   .x(d => x_scale(d.x))
                                   .y(d => y_scale(d.lower_limit)))
                .attr("fill","none")
                .attr("stroke", l99_colour)
                .attr("stroke-width", l99_width)
                .style("stroke-dasharray",("6,3"));
        } else if(linetype == "Upper") {
            LineObject.attr("d", d3.line<typeof viewModel.LimitLines>()
                                   .x(d => x_scale(d.x))
                                   .y(d => y_scale(d.upper_limit)))
                .attr("fill","none")
                .attr("stroke", l99_colour)
                .attr("stroke-width", l99_width)
                .style("stroke-dasharray",("6,3"));
        } else if(linetype == "Main") {
            LineObject.attr("d", d3.line<typeof viewModel.LimitLines>()
                                          .x(d => x_scale(d.x))
                                          .y(d => y_scale(d.ratio))
                                          .defined(d => (d.ratio != null)))
                      .attr("fill","none")
                      .attr("stroke", main_colour)
                      .attr("stroke-width", main_width);
        }
        LineObject.on("mouseover", d => {
                        // Get screen coordinates of mouse pointer, tooltip will
                        //   be displayed at these coordinates
                        //    Needs the '<any>' prefix, otherwise PowerBI doesn't defer
                        //      to d3 properly
                        let x = (<any>d3).event.pageX;
                        let y = (<any>d3).event.pageY;
                
                        tooltipService.show({
                            dataItems: [{
                                displayName: "Limit:",
                                value: linetype + (linetype == "Main" ? "" : " 99.8%")
                            }, {
                                displayName: "Value:",
                                value: (y_scale_inv(y)).toFixed(2)
                            }],
                            identities: [0],
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
                            dataItems: [{
                                displayName: "Limit:",
                                value: linetype + (linetype == "Main" ? "" : " 99.8%")
                            }, {
                                displayName: "Value:",
                                value: (y_scale_inv(y)).toFixed(2)
                            }],
                            identities: [0],
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
    } else if (linetype == "Target") {
        LineObject.attr("d", d3.line<typeof viewModel.LimitLines>()
                               .x(d => x_scale(d.x))
                               .y(d => y_scale(viewModel.target)))
            // Apply CSS class to elements so that they can be looked up later
            .attr("fill","none")
            .attr("stroke", target_colour)
            .attr("stroke-width", target_width);
    }

    LineObject.exit()
            .remove();
}

export default makeLines;