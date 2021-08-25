"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;
import makeDots from "./Plotting Functions/makeDots";
import makeLines from "./Plotting Functions/makeLines";
import updateSettings from "../src/updateSettings";
import getViewModel from "../src/getViewModel";
import * as d3 from "d3";
import * as mathjs from "mathjs";
import * as rmath from "lib-r-math.js";

// I don't know why it needs this, and at this point I'm too afraid to ask
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

// Used to represent the different datapoints on the chart
interface PlotData {
    x: number,
    l_limit: number;
    u_limit: number;
    ratio: number;
    colour: string;
    // ISelectionId allows the visual to report the selection choice to PowerBI
    identity: powerbi.visuals.ISelectionId;
    // Flag for whether dot should be highlighted by selections in other charts
    highlighted: boolean;
    // Tooltip data to print
    tooltips: VisualTooltipDataItem[];
    tick_labels: (number|string)[];
};

// Separator between code that gets data from PBI, and code that renders
//   the data in the visual
interface ViewModel {
    plotData: PlotData[];
    minLimit: number;
    maxLimit: number;
    target: number;
    highlights: boolean;
};

export class Visual implements IVisual {
    private host: IVisualHost;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private dotGroup: d3.Selection<SVGElement, any, any, any>;
    private lineGroup: d3.Selection<SVGElement, any, any, any>;
    private UL99Group: d3.Selection<SVGElement, any, any, any>;
    private LL99Group: d3.Selection<SVGElement, any, any, any>;
    private targetGroup: d3.Selection<SVGElement, any, any, any>;
    private xAxisGroup: d3.Selection<SVGGElement, any, any, any>;
    private xAxisLabels: d3.Selection<SVGGElement, any, any, any>;
    private yAxisGroup: d3.Selection<SVGGElement, any, any, any>;
    private yAxisLabels: d3.Selection<SVGGElement, any, any, any>;
    private viewModel: ViewModel;

    // Method for notifying PowerBI of changes in the visual to propagate to the
    //   rest of the report
    private selectionManager: ISelectionManager;


    // Settings for plot aesthetics
    private settings = {
        axispad: {
            x: {
                padding: {
                    default: 50,
                    value: 50
                }
            },
            y: {
                padding: {
                    default: 50,
                    value: 50
                }
            }
        },
        spc: {
            data_type: {
                default: "i",
                value: "i"
            },
            multiplier: {
                default: 1,
                value: 1
            }
        },
        scatter: {
            size: {
                default: 4,
                value: 4
            },
            colour: {
                default: "#000000",
                value: "#000000"
            },
            opacity: {
                default: 1,
                value: 1
            },
            opacity_unselected: {
                default: 0.2,
                value: 0.2
            }
        },
        lines: {
            width_99: {
                default: 3,
                value: 3
            },
            width_main: {
                default: 1.5,
                value: 1.5
            },
            width_target: {
                default: 1.5,
                value: 1.5
            },
            colour_99: {
                default: "#4682B4",
                value: "#4682B4"
            },
            colour_main: {
                default: "#000000",
                value: "#000000"
            },
            colour_target: {
                default: "#4682B4",
                value: "#4682B4"
            }
        },
        axis: {
            xlimit_label: {
                default: null,
                value: null
            },
            ylimit_label: {
                default: null,
                value: null
            },
            ylimit_l: {
                default: null,
                value: null
            },
            ylimit_u: {
                default: null,
                value: null
            },
            xlimit_l: {
                default: null,
                value: null
            },
            xlimit_u: {
                default: null,
                value: null
            }
        }
    }

    constructor(options: VisualConstructorOptions) {
        // Add reference to host object, for accessing environment (e.g. colour)
        this.host = options.host;

                    // Get reference to element object for manipulation
                    //   (reference to html container for visual)
        this.svg = d3.select(options.element)
                    // Create new svg element inside container
                     .append("svg");

        this.dotGroup = this.svg.append("g")
                                .classed("dot-group", true);

        this.UL99Group = this.svg.append("g")
                                .classed("ul-line-group", true);
        this.LL99Group = this.svg.append("g")
                                .classed("ll-line-group", true);
        this.targetGroup = this.svg.append("g")
                                .classed("tg-line-group", true);
        this.lineGroup = this.svg.append("g")
                                .classed("mn-line-group", true);

        // Add a grouping ('g') element to the canvas that will later become the x-axis
        this.xAxisGroup = this.svg.append("g")
                                  .classed("x-axis", true);
        this.xAxisLabels = this.svg.append("text");

        // Add a grouping ('g') element to the canvas that will later become the y-axis
        this.yAxisGroup = this.svg.append("g")
                                  .classed("y-axis", true);
        this.yAxisLabels = this.svg.append("text");

        // Request a new selectionManager tied to the visual
        this.selectionManager = this.host.createSelectionManager();
    }

    public update(options: VisualUpdateOptions) {
        // Update settings object with user-specified values (if present)
        updateSettings(this.settings, options.dataViews[0].metadata.objects);

        // Have to remove & re-append dot element to fix weird xbar/s bug
        this.svg.select(".dot-group").remove();
        this.dotGroup = this.svg.append("g")
                                .classed("dot-group", true);

        // Insert the viewModel object containing the user-input data
        //   This function contains the construction of the spc
        //   control limits
        this.viewModel = getViewModel(options, this.settings, this.host);
        

        // Get the width and height of plotting space
        let width = options.viewport.width;
        let height = options.viewport.height;

        // Add appropriate padding so that plotted data doesn't overlay axis
        let xAxisPadding = this.settings.axispad.x.padding.value;
        let yAxisPadding = this.settings.axispad.y.padding.value;
        let xAxisMin = this.settings.axis.xlimit_l.value ? this.settings.axis.xlimit_l.value : 0;
        let xAxisMax = this.settings.axis.xlimit_u.value ? this.settings.axis.xlimit_u.value : d3.max(this.viewModel.plotData.map(d => d.x))+1;
        let yAxisMin = this.settings.axis.ylimit_l.value ? this.settings.axis.ylimit_l.value : this.viewModel.minLimit;
        let yAxisMax = this.settings.axis.ylimit_u.value ? this.settings.axis.ylimit_u.value : this.viewModel.maxLimit;
        let data_type = this.settings.spc.data_type.value;
        let multiplier = this.settings.spc.multiplier.value;

        // Dynamically scale chart to use all available space
        this.svg.attr("width", width)
                .attr("height", height);

        // Define axes for chart.
        //   Takes a given plot axis value and returns the appropriate screen height
        //     to plot at.
        let yScale = d3.scaleLinear()
                       .domain([yAxisMin, yAxisMax])
                       .range([height - xAxisPadding, 0]);

        let xScale = d3.scaleLinear()
                        .domain([xAxisMin, xAxisMax])
                        .range([yAxisPadding, width]);

        // Specify inverse scaling that will return a plot axis value given an input
        //   screen height. Used to display line chart tooltips.
        let yScale_inv = d3.scaleLinear()
                       .domain([height - xAxisPadding, 0])
                       .range([this.viewModel.minLimit, this.viewModel.maxLimit]);

        let xLabels: (number|string)[][] = this.viewModel.plotData.map(d => d.tick_labels);

        let yAxis = d3.axisLeft(yScale)
                      .tickFormat(
                          d => data_type == "p" && multiplier == 1 ? (<number>d * 100) + "%" : <string><unknown>d
                      );
        let xAxis = d3.axisBottom(xScale)
                      .tickFormat(
                        d => <string>xLabels.filter(d2 => <number>d == d2[0]).map(d3 => d3[1])[0]
                      )

        // Draw axes on plot
        this.yAxisGroup
            .call(yAxis)
            .attr("transform", "translate(" +  yAxisPadding + ",0)");

        this.xAxisGroup
            .call(xAxis)
            // Plots the axis at the correct height
            .attr("transform", "translate(0, " + (height - xAxisPadding) + ")")
            .selectAll("text")
            // Rotate tick labels
            .attr("transform","rotate(-35)")
            // Right-align
            .style("text-anchor", "end")
            // Scale font
            .style("font-size","x-small");
 
        // Bind input data to dotGroup reference
        let dots = this.dotGroup
                       // List all child elements of dotGroup that have CSS class '.dot'
                       .selectAll(".dot")
                       // Matches input array to a list, returns three result sets
                       //   - HTML element for which there are no matching datapoint (if so, creates new elements to be appended)
                       .data(this.viewModel.plotData);

        // Update the datapoints if data is refreshed
        let dots_merged = dots.enter()
                              .append("circle")
                              .merge(<any>dots)
                              .classed("dot", true);

        // Plotting of scatter points
        makeDots(dots_merged, this.settings,
                 this.viewModel.highlights, this.selectionManager,
                 this.host.tooltipService, xScale, yScale);
        this.xAxisLabels
            .attr("x",width/2)
            .attr("y",height - xAxisPadding/10)
            .style("text-anchor", "middle")
            .text(this.settings.axis.xlimit_label.value);
        this.yAxisLabels
            .attr("x",yAxisPadding)
            .attr("y",height/2)
            .attr("transform","rotate(-90," + yAxisPadding/3 +"," + height/2 +")")
            .text(this.settings.axis.ylimit_label.value)
            .style("text-anchor", "end");

        // Bind calculated control limits and target line to respective plotting objects
        let linesMain= this.lineGroup
            .selectAll(".line")
            .data([this.viewModel.plotData]);
        let linesLL99 = this.LL99Group
            .selectAll(".line")
            .data([this.viewModel.plotData]);

        let linesUL99 = this.UL99Group
            .selectAll(".line")
            .data([this.viewModel.plotData]);
        
        let linesMainMerged = linesMain.enter()
                                         .append("path")
                                         .merge(<any>linesMain)
                                         .classed("line", true)

        let linesLL99Merged = linesLL99.enter()
                                         .append("path")
                                         .merge(<any>linesLL99)
                                         .classed("line", true)
        
        let linesUL99_merged = linesUL99.enter()
                                          .append("path")
                                          .merge(<any>linesUL99)
                                          .classed("line", true)

        let lineTarget = this.targetGroup
                             .selectAll(".line")
                             .data([this.viewModel.plotData]);

        let lineTarget_merged = lineTarget.enter()
                                            .append("path")
                                            .merge(<any>lineTarget)
                                            .classed("line", true)
        
        // Initial construction of lines, run when plot is first rendered.
        //   Text argument specifies which type of line is required (controls aesthetics),
        //   inverse scale objects used to display tooltips on drawn control limits 
        makeLines(linesMainMerged, this.settings,
                    xScale, yScale, "Main",
                    this.viewModel, this.host.tooltipService,
                    yScale_inv);
        makeLines(linesLL99Merged, this.settings,
                    xScale, yScale, "Lower",
                    this.viewModel, this.host.tooltipService,
                    yScale_inv);
        makeLines(linesUL99_merged, this.settings,
                    xScale, yScale, "Upper",
                    this.viewModel, this.host.tooltipService,
                    yScale_inv);

        makeLines(lineTarget_merged, this.settings,
                    xScale, yScale, "Target",
                    this.viewModel, this.host.tooltipService);
    }

    // Function to render the properties specified in capabilities.json to the properties pane
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): 
        VisualObjectInstanceEnumeration {
            let propertyGroupName = options.objectName;
            // Object that holds the specified settings/options to be rendered
            let properties: VisualObjectInstance[] = [];

            // Call a different function for each specified property group
            switch (propertyGroupName) {
                // Specify behaviour for x-axis settings
                case "spc":
                    // Add y-axis settings to object to be rendered
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            data_type: this.settings.spc.data_type.value,
                            multiplier: this.settings.spc.multiplier.value
                        },
                        selector: null
                    });
                break; 
                case "scatter":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            size: this.settings.scatter.size.value,
                            colour: this.settings.scatter.colour.value,
                            opacity: this.settings.scatter.opacity.value,
                            opacity_unselected: this.settings.scatter.opacity_unselected.value
                        },
                        selector: null
                    });
                break; 
                case "lines":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            width_99: this.settings.lines.width_99.value,
                            width_main: this.settings.lines.width_main.value,
                            width_target: this.settings.lines.width_target.value,
                            colour_99: this.settings.lines.colour_99.value,
                            colour_main: this.settings.lines.colour_main.value,
                            colour_target: this.settings.lines.colour_target.value
                        },
                        selector: null
                    });
                break;
                case "axis":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            xlimit_label: this.settings.axis.xlimit_label.value,
                            ylimit_label: this.settings.axis.ylimit_label.value,
                            ylimit_l: this.settings.axis.ylimit_l.value,
                            ylimit_u: this.settings.axis.ylimit_u.value,
                            xlimit_l: this.settings.axis.xlimit_l.value,
                            xlimit_u: this.settings.axis.xlimit_u.value
                        },
                        selector: null
                    });
                break; 
            };
            return properties;
        }
}