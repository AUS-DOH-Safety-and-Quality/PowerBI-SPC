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
import { groupedData, PlotData, nestArray } from "../src/Interfaces"
import { ViewModel } from "../src/Interfaces"

type LineType = d3.Selection<d3.BaseType, PlotData[], SVGElement, any>;
type MergedLineType = d3.Selection<SVGPathElement, PlotData[], SVGElement, any>;

export class Visual implements IVisual {
    private host: IVisualHost;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private listeningRect: d3.Selection<SVGElement, any, any, any>;
    private listeningRectSelection: d3.Selection<any, any, any, any>;
    private tooltipLineGroup: d3.Selection<SVGElement, any, any, any>;
    private tooltipLineSelection: d3.Selection<any, any, any, any>;
    private dotGroup: d3.Selection<SVGElement, any, any, any>;
    private dotSelection: d3.Selection<any, any, any, any>;
    private lineGroup: d3.Selection<SVGElement, any, any, any>;
    private lineSelection: any;
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
        this.tooltipLineGroup = this.svg.append("g")
                                .classed("tooltip-group", true);
        this.lineGroup = this.svg.append("g")
                                .classed("line-group", true);
        this.dotGroup = this.svg.append("g")
                                .classed("dot-group", true);

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
            highlightIfSelected(this.dotSelection,
                                this.lineSelection,
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

        this.settings.spc.data_type.value = this.viewModel.data_type ? this.viewModel.data_type : this.settings.spc.data_type.value;
        this.settings.spc.multiplier.value = this.viewModel.multiplier ? this.viewModel.multiplier : this.settings.spc.multiplier.value;

        // Get the width and height of plotting space
        let width: number = options.viewport.width;
        let height: number = options.viewport.height;

        // Add appropriate padding so that plotted data doesn't overlay axis
        let xAxisPadding: number = this.settings.axispad.x.padding.value;
        let yAxisPadding: number = this.settings.axispad.y.padding.value;
        let xAxisEndPadding: number = this.settings.axispad.x.end_padding.value;
        let yAxisEndPadding: number = this.settings.axispad.y.end_padding.value;
        let xAxisMin: number = this.settings.axis.xlimit_l.value ? this.settings.axis.xlimit_l.value : 0;
        let xAxisMax: number = this.settings.axis.xlimit_u.value ? this.settings.axis.xlimit_u.value : d3.max(this.viewModel.plotData.map(d => d.x)) + 1;
        let yAxisMin: number = this.settings.axis.ylimit_l.value ? this.settings.axis.ylimit_l.value : this.viewModel.minLimit;
        let yAxisMax: number = this.settings.axis.ylimit_u.value ? this.settings.axis.ylimit_u.value : this.viewModel.maxLimit;
        let data_type: string = this.settings.spc.data_type.value;
        let multiplier: number = this.settings.spc.multiplier.value;
        let displayAxes: boolean = this.viewModel.plotData.length > 1;

        // Dynamically scale chart to use all available space
        this.svg.attr("width", width)
                .attr("height", height);

        // Define axes for chart.
        //   Takes a given plot axis value and returns the appropriate screen height
        //     to plot at.
        let yScale: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([yAxisMin, yAxisMax])
                .range([height - xAxisPadding, xAxisEndPadding]);

        let xScale: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([xAxisMin, xAxisMax])
                .range([yAxisPadding, width - yAxisEndPadding]);

        this.listeningRectSelection = this.listeningRect
                                          .selectAll(".obs-sel")
                                          .data(this.viewModel.plotData);
        this.tooltipLineSelection = this.tooltipLineGroup
                                          .selectAll(".ttip-line")
                                          .data(this.viewModel.plotData);

        if (this.viewModel.plotData.length > 1) {
            initTooltipTracking(this.svg, this.listeningRectSelection, this.tooltipLineSelection, width, height - xAxisPadding,
                xScale, yScale, this.host.tooltipService, this.viewModel);
        }

        let xLabels: (number|string)[][] = this.viewModel.plotData.map(d => d.tick_labels);

        let yAxis: d3.Axis<d3.NumberValue>
            = d3.axisLeft(yScale)
                .tickFormat(
                    d => {
                      // If axis displayed on % scale, then disable axis values > 100%
                      let prop_limits: boolean = data_type == "p" && multiplier == 1;
                      return prop_limits ? (d <= 1 ? (<number>d * 100).toFixed(2) + "%" : "" ) : <string><unknown>d;
                    }
                );
        let xAxis: d3.Axis<d3.NumberValue>
            = d3.axisBottom(xScale)
                .tickFormat(
                    d => <string>xLabels.filter(d2 => <number>d == d2[0]).map(d3 => d3[1])[0]
                )

            // Draw axes on plot
            this.yAxisGroup
                .call(yAxis)
                .attr("color", displayAxes ? "#000000" : "#FFFFFF")
                .attr("transform", "translate(" +  yAxisPadding + ",0)");

            this.xAxisGroup
                .call(xAxis)
                .attr("color", displayAxes ? "#000000" : "#FFFFFF")
                // Plots the axis at the correct height
                .attr("transform", "translate(0, " + (height - xAxisPadding) + ")")
                .selectAll("text")
                // Rotate tick labels
                .attr("transform","rotate(-35)")
                // Right-align
                .style("text-anchor", "end")
                // Scale font
                .style("font-size","x-small");

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


        this.lineSelection = this.lineGroup
                                 .selectAll(".line")
                                 .data(this.viewModel.groupedLines);

        let lineMerged = makeLines(this.lineSelection, this.settings, xScale, yScale, this.viewModel, this.viewModel.highlights);

        // Bind input data to dotGroup reference
         this.dotSelection = this.dotGroup
                       // List all child elements of dotGroup that have CSS class '.dot'
                       .selectAll(".dot")
                       // Matches input array to a list, returns three result sets
                       //   - HTML element for which there are no matching datapoint (if so, creates new elements to be appended)
                       .data(this.viewModel.plotData);

        makeDots(this.dotSelection, lineMerged, this.settings,
                    this.viewModel.highlights, this.selectionManager,
                    this.host.tooltipService, xScale, yScale, this.svg);

        this.svg.on('contextmenu', () => {
            const eventTarget: EventTarget = (<any>d3).event.target;
            let dataPoint: PlotData = <PlotData>(d3.select(<d3.BaseType>eventTarget).datum());
            this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
                x: (<any>d3).event.clientX,
                y: (<any>d3).event.clientY
            });
            (<any>d3).event.preventDefault();
        });

        if (this.viewModel.highlights) {
            lineMerged.style("stroke-opacity", this.settings.scatter.opacity_unselected.value)
        }
        this.listeningRectSelection.exit().remove()
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
                            multiplier: this.settings.spc.multiplier.value,
                            denom_split: this.settings.spc.denom_split.value
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
                            width_95: this.settings.lines.width_95.value,
                            width_main: this.settings.lines.width_main.value,
                            width_target: this.settings.lines.width_target.value,
                            colour_99: this.settings.lines.colour_99.value,
                            colour_95: this.settings.lines.colour_95.value,
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
