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
import ISelectionId = powerbi.visuals.ISelectionId;
import makeDots from "./Plotting Functions/makeDots";
import makeLines from "./Plotting Functions/makeLines";
import updateSettings from "./Settings/updateSettings";
import getViewModel from "../src/getViewModel";
import highlightIfSelected from "./Selection Helpers/highlightIfSelected";
import initSettings from "../src/Settings/initSettings"
import initTooltipTracking from "./Plotting Functions/initTooltipTracking";
import * as d3 from "d3";
import { PlotData } from "../src/Interfaces"
import { ViewModel } from "../src/Interfaces"

type LineType = d3.Selection<d3.BaseType, PlotData[], SVGElement, any>;
type MergedLineType = d3.Selection<SVGPathElement, PlotData[], SVGElement, any>;

export class Visual implements IVisual {
    private host: IVisualHost;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private listeningRect: d3.Selection<SVGElement, any, any, any>;
    private dotGroup: d3.Selection<SVGElement, any, any, any>;
    private dots: d3.Selection<any, any, any, any>;
    private linesMain: d3.Selection<any, any, any, any>;
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
    private settings = initSettings();

    constructor(options: VisualConstructorOptions) {
        // Add reference to host object, for accessing environment (e.g. colour)
        this.host = options.host;

                    // Get reference to element object for manipulation
                    //   (reference to html container for visual)
        this.svg = d3.select(options.element)
                    // Create new svg element inside container
                     .append("svg");

        this.listeningRect = this.svg.append("g")
                                     .classed("listen-group", true);

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

        // Update dot highlighting on initialisation
        this.selectionManager.registerOnSelectCallback(() => {
            highlightIfSelected(this.dots,
                                this.linesMain,
                                this.selectionManager.getSelectionIds() as ISelectionId[],
                                this.settings.scatter.opacity.value,
                                this.settings.scatter.opacity_unselected.value);
        })
    }

    public update(options: VisualUpdateOptions) {
        // Update settings object with user-specified values (if present)
        updateSettings(this.settings, options.dataViews[0].metadata.objects);

        // Insert the viewModel object containing the user-input data
        //   This function contains the construction of the spc
        //   control limits
        this.viewModel = getViewModel(options, this.settings, this.host);

        // Get the width and height of plotting space
        let width: number = options.viewport.width;
        let height: number = options.viewport.height;

        // Add appropriate padding so that plotted data doesn't overlay axis
        let xAxisPadding: number = this.settings.axispad.x.padding.value;
        let yAxisPadding: number = this.settings.axispad.y.padding.value;
        let xAxisMin: number = this.settings.axis.xlimit_l.value ? this.settings.axis.xlimit_l.value : 0;
        let xAxisMax: number = this.settings.axis.xlimit_u.value ? this.settings.axis.xlimit_u.value : d3.max(this.viewModel.plotData.map(d => d.x)) + 1;
        let yAxisMin: number = this.settings.axis.ylimit_l.value ? this.settings.axis.ylimit_l.value : this.viewModel.minLimit;
        let yAxisMax: number = this.settings.axis.ylimit_u.value ? this.settings.axis.ylimit_u.value : this.viewModel.maxLimit;
        let data_type: string = this.settings.spc.data_type.value;
        let multiplier: number = this.settings.spc.multiplier.value;

        // Dynamically scale chart to use all available space
        this.svg.attr("width", width)
                .attr("height", height);

        // Define axes for chart.
        //   Takes a given plot axis value and returns the appropriate screen height
        //     to plot at.
        let yScale: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([yAxisMin, yAxisMax])
                .range([height - xAxisPadding, 0]);

        let xScale: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([xAxisMin, xAxisMax])
                .range([yAxisPadding, width]);


        initTooltipTracking(this.svg, this.listeningRect, width, height - xAxisPadding,
            xScale, yScale, this.host.tooltipService, this.viewModel);

        // Specify inverse scaling that will return a plot axis value given an input
        //   screen height. Used to display line chart tooltips.
        let yScale_inv: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([height - xAxisPadding, 0])
                .range([this.viewModel.minLimit, this.viewModel.maxLimit]);

        let xLabels: (number|string)[][] = this.viewModel.plotData.map(d => d.tick_labels);

        let yAxis: d3.Axis<d3.NumberValue>
            = d3.axisLeft(yScale)
                .tickFormat(
                    d => data_type == "p" && multiplier == 1 ? (<number>d * 100).toFixed(2) + "%" : <string><unknown>d
                );
        let xAxis: d3.Axis<d3.NumberValue>
            = d3.axisBottom(xScale)
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
        this.dots = this.dotGroup
                       // List all child elements of dotGroup that have CSS class '.dot'
                       .selectAll(".dot")
                       // Matches input array to a list, returns three result sets
                       //   - HTML element for which there are no matching datapoint (if so, creates new elements to be appended)
                       .data(this.viewModel.plotData);


        this.xAxisLabels.attr("x",width/2)
            .attr("y",height - xAxisPadding/10)
            .style("text-anchor", "middle")
            .text(this.settings.axis.xlimit_label.value);
        this.yAxisLabels
            .attr("x",yAxisPadding)
            .attr("y",height/2)
            .attr("transform","rotate(-90," + yAxisPadding/3 +"," + height/2 +")")
            .text(this.settings.axis.ylimit_label.value)
            .style("text-anchor", "end");



        let linesLL99: LineType = this.LL99Group
            .selectAll(".line")
            .data([this.viewModel.plotData]);

        let linesUL99: LineType = this.UL99Group
            .selectAll(".line")
            .data([this.viewModel.plotData]);
        
        let lineTarget: LineType = this.targetGroup
                                       .selectAll(".line")
                                       .data([this.viewModel.plotData]);

        // Initial construction of lines, run when plot is first rendered.
        //   Text argument specifies which type of line is required (controls aesthetics),
        //   inverse scale objects used to display tooltips on drawn control limits 

        [
         [linesLL99, "Lower"],
         [linesUL99, "Upper"],
         [lineTarget, "Target"]
        ].map(d => makeLines(<LineType>d[0], this.settings,
                             xScale, yScale, <string>d[1],
                             this.viewModel, this.host.tooltipService,
                             yScale_inv));
        // Bind calculated control limits and target line to respective plotting objects
        this.linesMain = this.lineGroup
            .selectAll(".line")
            .data([this.viewModel.plotData]);

        let MergedMain: MergedLineType =  makeLines(this.linesMain, this.settings,
                                                    xScale, yScale, "Main",
                                                    this.viewModel, this.host.tooltipService,
                                                    yScale_inv);
        // Plotting of scatter points
        makeDots(this.dots, MergedMain, this.settings,
                    this.viewModel.highlights, this.selectionManager,
                    this.host.tooltipService, xScale, yScale, this.svg);
    }

    // Function to render the properties specified in capabilities.json to the properties pane
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): 
        VisualObjectInstanceEnumeration {
            let propertyGroupName: string = options.objectName;
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
