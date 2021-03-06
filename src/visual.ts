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
import settingsObject from "./Classes/settingsObject"
import viewModelObject from "./Classes/viewModel"
import plotData from "./Classes/plotData";
import * as d3 from "d3";
import lineData from "./Classes/lineData"
import plotPropertiesClass from "./Classes/plotProperties"
import svgObjectClass from "./Classes/svgObjectClass"
import svgSelectionClass from "./Classes/svgSelectionClass"
import getGroupKeys from "./Functions/getGroupKeys"
import { groupKeysT } from "./Functions/getGroupKeys"

type SelectionAny = d3.Selection<any, any, any, any>;
type SelectionSVG = d3.Selection<SVGElement, any, any, any>;
type mergedSVGObjects = { dotsMerged: SelectionAny,
                          linesMerged: SelectionAny }

export class Visual implements IVisual {
  private host: IVisualHost;
  private svg: SelectionSVG;
  private svgObjects: svgObjectClass;
  private svgSelections: svgSelectionClass;
  private viewModel: viewModelObject;
  private plottingMerged: mergedSVGObjects;
  private plotProperties: plotPropertiesClass;
  private selectionManager: ISelectionManager;
  private settings: settingsObject;

  constructor(options: VisualConstructorOptions) {
    console.log("Constructor start")
    this.host = options.host;
    this.svg = d3.select(options.element)
                  .append("svg");

    this.svgObjects = new svgObjectClass(this.svg);

    this.selectionManager = this.host.createSelectionManager();
    this.settings = new settingsObject();

    this.plottingMerged = { dotsMerged: null, linesMerged: null };

    this.selectionManager.registerOnSelectCallback(() => {
      this.updateHighlighting();
    })
    console.log("Constructor finish")
  }

  public update(options: VisualUpdateOptions) {
    this.settings.updateSettings(options.dataViews[0].metadata.objects);
    console.log("Updated settings")

    this.viewModel = new viewModelObject({ options: options,
                                          inputSettings: this.settings,
                                          host: this.host });
    console.log("Created viewmodel")
    console.log(this.viewModel)

    this.svgSelections = new svgSelectionClass({ svgObjects: this.svgObjects,
                                                  viewModel: this.viewModel});
    console.log("Made svgSelections")

    this.plotProperties = new plotPropertiesClass({
      options: options,
      viewModel: this.viewModel,
      inputSettings: this.settings
    });
    console.log("Made plot properties")

    console.log(this.plotProperties)

    this.svg.attr("width", this.plotProperties.width)
            .attr("height", this.plotProperties.height);

    console.log("start tooltip")
    this.initTooltipTracking();
    console.log("finish tooltip")

    this.drawXAxis();
    console.log("finish x-axis")
    this.drawYAxis();
    console.log("finish y-axis")

    this.drawLines();
    console.log("finish lines")
    this.drawDots();
    console.log("finish dots")

    this.addContextMenu();
    console.log("finish context menu")
  }

  // Function to render the properties specified in capabilities.json to the properties pane
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
    VisualObjectInstanceEnumeration {
      let propertyGroupName: string = options.objectName;
      // Object that holds the specified settings/options to be rendered
      let properties: VisualObjectInstance[] = [];
      properties.push({
        objectName: propertyGroupName,
        properties: this.settings.returnValues(propertyGroupName, this.viewModel.inputData),
        selector: null
      });
      return properties;
  }

  initTooltipTracking(): void {
    let xAxisLine = this.svgSelections.tooltipLineSelection
                        .enter()
                        .append("rect")
                        .merge(<any>this.svgSelections.tooltipLineSelection);
    xAxisLine.classed("ttip-line", true);
    xAxisLine.attr("stroke-width", "1px")
            .attr("width", ".5px")
            .attr("height", this.plotProperties.height)
            .style("fill-opacity", 0);

    let tooltipMerged
        = this.svgSelections
              .listeningRectSelection
              .enter()
              .append("rect")
              .merge(<any>this.svgSelections.listeningRectSelection)
    tooltipMerged.classed("obs-sel", true);

    tooltipMerged.style("fill","transparent")
            .attr("width", this.plotProperties.width)
            .attr("height", this.plotProperties.height);
    console.log("display: ", this.viewModel.displayPlot)
    console.log("tooltip width: ", this.plotProperties.width)
    console.log("tooltip height: ", this.plotProperties.height)
    if (this.viewModel.displayPlot) {
      tooltipMerged.on("mousemove", () => {
                let xValue: number = this.plotProperties
                                              .xScale
                                              .invert((<any>d3).event.pageX);
                let xRange: number[] = this.viewModel.plotPoints.map(d => d.x);
                let nearestDenominator: number = d3.bisectLeft(
                  xRange,
                  xValue,
                  0,
                  xRange.length - 1
                );
                let scaled_x: number = this.plotProperties.xScale(nearestDenominator)
                let scaled_y: number = this.plotProperties.yScale(this.viewModel.plotPoints[nearestDenominator].value)

                this.host.tooltipService.show({
                    dataItems: this.viewModel.plotPoints[nearestDenominator].tooltip,
                    identities: [this.viewModel.plotPoints[nearestDenominator].identity],
                    coordinates: [scaled_x, scaled_y],
                    isTouchEvent: false
                });
                xAxisLine.style("fill-opacity", 1)
                        .attr("transform", "translate(" + scaled_x + ",0)");
            });
            tooltipMerged.on("mouseleave", () => {
                this.host.tooltipService.hide({
                    immediately: true,
                    isTouchEvent: false
                });
                xAxisLine.style("fill-opacity", 0);
            });
    } else {
      tooltipMerged.on("mousemove", () => {});
      tooltipMerged.on("mouseleave", () => {});
    }
    xAxisLine.exit().remove()
    tooltipMerged.exit().remove()
   // this.svgSelections.listeningRectSelection.exit().remove()
  }

  drawXAxis(): void {
    let xAxisPadding: number = this.viewModel.axisLimits.x.padding;
    let xAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(this.plotProperties.xScale);

    if (this.viewModel.displayPlot) {
      xAxis.tickFormat(d => {
        return this.viewModel.tickLabels.map(d => d.x).includes(<number>d)
          ? this.viewModel.tickLabels[<number>d].label
          : "";
      })
    }

    this.svgObjects.xAxisGroup
        .call(xAxis)
        .attr("color", this.viewModel.displayPlot ? "#000000" : "#FFFFFF")
        // Plots the axis at the correct height
        .attr("transform", "translate(0, " + (this.plotProperties.height - xAxisPadding) + ")")
        .selectAll("text")
        // Rotate tick labels
        .attr("transform","rotate(-35)")
        // Right-align
        .style("text-anchor", "end")
        // Scale font
        .style("font-size","x-small");

    this.svgObjects.xAxisLabels.attr("x",this.plotProperties.width/2)
        .attr("y",this.plotProperties.height - xAxisPadding/10)
        .style("text-anchor", "middle")
        .text(this.settings.axis.xlimit_label.value);
  }

  drawYAxis(): void {
    let yAxisPadding: number = this.viewModel.axisLimits.y.padding;

    let yAxis: d3.Axis<d3.NumberValue>
      = d3.axisLeft(this.plotProperties.yScale)
          .tickFormat(
              d => {
                return this.viewModel.percentLabels
                  ? (<number>d * 100).toFixed(2) + "%"
                  : d.toString();
              }
          );

    // Draw axes on plot
    this.svgObjects.yAxisGroup
        .call(yAxis)
        .attr("color", this.viewModel.displayPlot ? "#000000" : "#FFFFFF")
        .attr("transform", "translate(" +  yAxisPadding + ",0)");

    this.svgObjects.yAxisLabels
        .attr("x",yAxisPadding)
        .attr("y",this.plotProperties.height/2)
        .attr("transform","rotate(-90," + yAxisPadding/3 +"," + this.plotProperties.height/2 +")")
        .text(this.settings.axis.ylimit_label.value)
        .style("text-anchor", "end");
  }

  drawLines(): void {
    console.log("start")
    let lineMetadata: groupKeysT = getGroupKeys({ inputSettings: this.settings,
                                                  viewModel: this.viewModel})
    console.log("get keys")
    console.log(lineMetadata)
    let line_color = d3.scaleOrdinal()
                        .domain(lineMetadata.keys)
                        .range(lineMetadata.colours);
    console.log("set colours")

    let line_width = d3.scaleOrdinal()
                        .domain(lineMetadata.keys)
                        .range(lineMetadata.widths);
    console.log("set widths")

    this.plottingMerged.linesMerged = this.svgSelections.lineSelection
                          .enter()
                          .append("path")
                          .merge(<any>this.svgSelections.lineSelection);

    console.log("merge lines")
    this.plottingMerged.linesMerged.classed('line', true);
    this.plottingMerged.linesMerged.attr("d", d => {
        return d3.line<lineData>()
                  .x(d => this.plotProperties.xScale(d.x))
                  .y(d => this.plotProperties.yScale(d.line_value))
                  .defined(function(d) {return d.line_value !== null})
                  (d.values)
    });
    console.log("add data")
    this.plottingMerged.linesMerged.attr("fill", "none")
                    .attr("stroke", d => <string>line_color(d.key))
                    .attr("stroke-width", d => <number>line_width(d.key));
    console.log("add aesthetics")
    this.svgSelections.lineSelection.exit().remove();
    this.plottingMerged.linesMerged.exit().remove();
  }

  drawDots(): void {
    let dot_size: number = this.settings.scatter.size.value;
    let dot_colour: string = this.settings.scatter.colour.value;

    // Update the datapoints if data is refreshed
    this.plottingMerged.dotsMerged = this.svgSelections.dotSelection.enter()
                  .append("circle")
                  .merge(<any>this.svgSelections.dotSelection);

    this.plottingMerged.dotsMerged.classed("dot", true);

    this.plottingMerged.dotsMerged.filter(d => (d.value != null))
              .attr("cy", d => this.plotProperties.yScale(d.value))
              .attr("cx", d => this.plotProperties.xScale(d.x))
              .attr("r", dot_size)
            // Fill each dot with the colour in each DataPoint
              .style("fill", d => dot_colour);

    // Change opacity (highlighting) with selections in other plots
    // Specify actions to take when clicking on dots
    this.plottingMerged.dotsMerged
        .on("click", d => {
            // Pass identities of selected data back to PowerBI
            this.selectionManager
                // Propagate identities of selected data back to
                //   PowerBI based on all selected dots
                .select(d.identity, (<any>d3).event.ctrlKey)
                // Change opacity of non-selected dots
                .then(() => { this.updateHighlighting(); });
                (<any>d3).event.stopPropagation();
          });
    if (this.viewModel.displayPlot) {
          // Display tooltip content on mouseover
      this.plottingMerged.dotsMerged.on("mouseover", d => {
              // Get screen coordinates of mouse pointer, tooltip will
              //   be displayed at these coordinates
              //    Needs the '<any>' prefix, otherwise PowerBI doesn't defer
              //      to d3 properly
              let x = (<any>d3).event.pageX;
              let y = (<any>d3).event.pageY;

              this.host.tooltipService.show({
                  dataItems: d.tooltip,
                  identities: [d.identity],
                  coordinates: [x, y],
                  isTouchEvent: false
              });
          })
          // Hide tooltip when mouse moves out of dot
          .on("mouseout", () => {
              this.host.tooltipService.hide({
                  immediately: true,
                  isTouchEvent: false
              })
          });
    } else {
      this.plottingMerged.dotsMerged.on("mousemove", d => {})
                                    .on("mouseleave", d => {});
    }


    this.updateHighlighting();
    this.svgSelections.dotSelection.exit().remove();
    this.plottingMerged.dotsMerged.exit().remove();

    this.svg.on('click', () => {
        this.selectionManager.clear();
        this.updateHighlighting();
    });
  }

  addContextMenu(): void {
    this.svg.on('contextmenu', () => {
        const eventTarget: EventTarget = (<any>d3).event.target;
        let dataPoint: plotData = <plotData>(d3.select(<d3.BaseType>eventTarget).datum());
        this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
            x: (<any>d3).event.clientX,
            y: (<any>d3).event.clientY
        });
        (<any>d3).event.preventDefault();
    });
  }

  updateHighlighting(): void {
    if (!this.plottingMerged.dotsMerged || !this.plottingMerged.linesMerged) {
        return;
    }
    let anyHighlights: boolean = this.viewModel.anyHighlights;
    let allSelectionIDs: ISelectionId[] = this.selectionManager.getSelectionIds() as ISelectionId[];

    let opacityFull: number = this.settings.scatter.opacity.value;
    let opacityReduced: number = this.settings.scatter.opacity_unselected.value;
    let defaultOpacity: number = (anyHighlights || (allSelectionIDs.length > 0))
                                    ? opacityReduced
                                    : opacityFull;
    this.plottingMerged.linesMerged.style("stroke-opacity", defaultOpacity);
    this.plottingMerged.dotsMerged.style("fill-opacity", defaultOpacity);

    if (anyHighlights || (allSelectionIDs.length > 0)) {
    this.plottingMerged.dotsMerged.style("fill-opacity", (dot: plotData) => {
      let currentPointSelected: boolean = allSelectionIDs.some((currentSelectionId: ISelectionId) => {
        return currentSelectionId.includes(dot.identity);
      });
      let currentPointHighlighted: boolean = dot.highlighted;
      return (currentPointSelected || currentPointHighlighted) ? opacityFull : opacityReduced;
    })
    }
  }
}
