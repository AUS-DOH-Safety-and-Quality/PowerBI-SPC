"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import extensibility = powerbi.extensibility;
import visuals = powerbi.visuals;
import ex_visual = extensibility.visual;
import IVisual = extensibility.IVisual;
import VisualConstructorOptions = ex_visual.VisualConstructorOptions;
import VisualUpdateOptions = ex_visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import IVisualHost = ex_visual.IVisualHost;
import ISelectionManager = extensibility.ISelectionManager;
import ISelectionId = visuals.ISelectionId;
import IVisualEventService = extensibility.IVisualEventService;
import viewModelObject from "./Classes/viewModel"
import plotData from "./Classes/plotData";
import * as d3 from "d3";
import lineData from "./Classes/lineData"
import svgObjectClass from "./Classes/svgObjectClass"
import svgIconClass from "./Classes/svgIconClass"
import svgSelectionClass from "./Classes/svgSelectionClass"
import { axisProperties } from "./Classes/plotProperties"
import getAesthetic from "./Functions/getAesthetic"
import between from "./Functions/between";

type SelectionAny = d3.Selection<any, any, any, any>;
type mergedSVGObjects = { dotsMerged: SelectionAny,
                          linesMerged: SelectionAny }

export class Visual implements IVisual {
  private host: IVisualHost;
  private updateOptions: VisualUpdateOptions;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private svgObjects: svgObjectClass;
  private svgIcons: svgIconClass;
  private svgSelections: svgSelectionClass;
  private viewModel: viewModelObject;
  private plottingMerged: mergedSVGObjects;
  private selectionManager: ISelectionManager;
  // Service for notifying external clients (export to powerpoint/pdf) of rendering status
  private events: IVisualEventService;
  private refreshingAxis: boolean;

  constructor(options: VisualConstructorOptions) {
    console.log("Constructor start")
    this.events = options.host.eventService;
    this.host = options.host;
    this.svg = d3.select(options.element)
                  .append("svg");

    this.svgObjects = new svgObjectClass(this.svg);
    this.svgIcons = new svgIconClass(this.svg);
    this.svgSelections = new svgSelectionClass();
    this.viewModel = new viewModelObject();
    this.viewModel.firstRun = true;

    this.selectionManager = this.host.createSelectionManager();

    this.plottingMerged = { dotsMerged: null, linesMerged: null };

    this.selectionManager.registerOnSelectCallback(() => {
      this.updateHighlighting();
    })
    console.log("Constructor finish")
  }

  public update(options: VisualUpdateOptions) {
    console.log("Update start")
    try {
      this.events.renderingStarted(options);
      console.log(options)
      this.updateOptions = options;

      console.log("viewModel start")
      this.viewModel.update({ options: options,
                              host: this.host });
      console.log(this.viewModel)

      console.log("svgSelections start")
      this.svgSelections.update({ svgObjects: this.svgObjects,
                                  viewModel: this.viewModel});

      console.log("svg scale start")
      this.svg.attr("width", this.viewModel.plotProperties.width)
              .attr("height", this.viewModel.plotProperties.height);

      //this.svgIcons.drawIcons(this.viewModel.plotProperties.height);
      console.log(this.viewModel.plotProperties)

      console.log("TooltipTracking start")
      this.initTooltipTracking();

      console.log("Draw axes start")
      this.drawXAxis();
      this.drawYAxis();

      console.log("Draw Lines start")
      this.drawLines();

      console.log("Draw dots start")
      this.drawDots();

      this.addContextMenu();
      this.events.renderingFinished(options);
      console.log("Update finished")
    } catch (caught_error) {
      console.error(caught_error)
      this.events.renderingFailed(options);
    }
  }

  // Function to render the properties specified in capabilities.json to the properties pane
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
    return this.viewModel.inputSettings.createSettingsEntry(options.objectName);
  }

  initTooltipTracking(): void {
    let xAxisLine = this.svgSelections
                        .tooltipLineSelection
                        .enter()
                        .append("rect")
                        .merge(<any>this.svgSelections.tooltipLineSelection);
    xAxisLine.classed("ttip-line", true);
    xAxisLine.attr("stroke-width", "1px")
            .attr("width", ".5px")
            .attr("height", this.viewModel.plotProperties.height)
            .style("fill-opacity", 0);

    let tooltipMerged = this.svgSelections
                            .listeningRectSelection
                            .enter()
                            .append("rect")
                            .merge(<any>this.svgSelections.listeningRectSelection)
    tooltipMerged.classed("obs-sel", true);

    tooltipMerged.style("fill","transparent")
                 .attr("width", this.viewModel.plotProperties.width)
                 .attr("height", this.viewModel.plotProperties.height);

    tooltipMerged.on("mousemove", (event) => {
      if (this.viewModel.plotProperties.displayPlot) {
        let xValue: number = this.viewModel.plotProperties.xScale.invert(event.pageX);
        let xRange: number[] = this.viewModel
                                    .plotPoints
                                    .map(d => d.x)
                                    .map(d => Math.abs(d - xValue));
        let nearestDenominator: number = d3.leastIndex(xRange,(a,b) => a-b);
        let scaled_x: number = this.viewModel.plotProperties.xScale(this.viewModel.plotPoints[nearestDenominator].x)
        let scaled_y: number = this.viewModel.plotProperties.yScale(this.viewModel.plotPoints[nearestDenominator].value)

        this.host.tooltipService.show({
          dataItems: this.viewModel.plotPoints[nearestDenominator].tooltip,
          identities: [this.viewModel.plotPoints[nearestDenominator].identity],
          coordinates: [scaled_x, scaled_y],
          isTouchEvent: false
        });
        xAxisLine.style("fill-opacity", 1).attr("transform", "translate(" + scaled_x + ",0)");
      }
    });

    tooltipMerged.on("mouseleave", () => {
      if (this.viewModel.plotProperties.displayPlot) {
        this.host.tooltipService.hide({
            immediately: true,
            isTouchEvent: false
        });
        xAxisLine.style("fill-opacity", 0);
      }
    });
    xAxisLine.exit().remove()
    tooltipMerged.exit().remove()
  }

  drawXAxis(): void {
    let xAxisProperties: axisProperties = this.viewModel.plotProperties.xAxis;
    let xAxis: d3.Axis<d3.NumberValue>;

    if (xAxisProperties.ticks) {
      xAxis = d3.axisBottom(this.viewModel.plotProperties.xScale);
      if (xAxisProperties.tick_count) {
        xAxis.ticks(xAxisProperties.tick_count)
      }
      if (this.viewModel.tickLabels) {
        xAxis.tickFormat(d => {
          return this.viewModel.tickLabels.map(d => d.x).includes(<number>d)
            ? this.viewModel.tickLabels[<number>d].label
            : "";
        })
      }
    } else {
      xAxis = d3.axisBottom(this.viewModel.plotProperties.xScale).tickValues([]);
    }

    let axisHeight: number = this.viewModel.plotProperties.height - this.viewModel.plotProperties.yAxis.end_padding;

    this.svgObjects
        .xAxisGroup
        .call(xAxis)
        .attr("color", this.viewModel.plotProperties.displayPlot ? xAxisProperties.colour : "#FFFFFF")
        // Plots the axis at the correct height
        .attr("transform", "translate(0, " + axisHeight + ")")
        .selectAll(".tick text")
        // Right-align
        .style("text-anchor", xAxisProperties.tick_rotation < 0.0 ? "end" : "start")
        // Rotate tick labels
        .attr("dx", xAxisProperties.tick_rotation < 0.0 ? "-.8em" : ".8em")
        .attr("dy", xAxisProperties.tick_rotation < 0.0 ? "-.15em" : ".15em")
        .attr("transform","rotate(" + xAxisProperties.tick_rotation + ")")
        // Scale font
        .style("font-size", xAxisProperties.tick_size)
        .style("font-family", xAxisProperties.tick_font)
        .style("fill", this.viewModel.plotProperties.displayPlot ? xAxisProperties.tick_colour : "#FFFFFF");

    let xAxisCoordinates: DOMRect = this.svgObjects.xAxisGroup.node().getBoundingClientRect() as DOMRect;

    // Update padding and re-draw axis if large tick values rendered outside of plot
    let tickBelowPlotAmount: number = xAxisCoordinates.bottom - this.viewModel.plotProperties.height;
    let tickLeftofPlotAmount: number = xAxisCoordinates.left;
    if ((tickBelowPlotAmount > 0 || tickLeftofPlotAmount < 0)) {
      if (!this.refreshingAxis) {
        this.refreshingAxis = true
        this.viewModel.plotProperties.yAxis.end_padding += tickBelowPlotAmount;
        this.viewModel.plotProperties.initialiseScale();
        this.drawXAxis();
      }
    }
    this.refreshingAxis = false

    let bottomMidpoint: number = this.viewModel.plotProperties.height - (this.viewModel.plotProperties.height - xAxisCoordinates.bottom) / 2.5;

    this.svgObjects
        .xAxisLabels
        .attr("x",this.viewModel.plotProperties.width/2)
        .attr("y", bottomMidpoint)
        .style("text-anchor", "middle")
        .text(xAxisProperties.label)
        .style("font-size", xAxisProperties.label_size)
        .style("font-family", xAxisProperties.label_font)
        .style("fill", this.viewModel.plotProperties.displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
  }

  drawYAxis(): void {
    let yAxisProperties: axisProperties = this.viewModel.plotProperties.yAxis;
    let yAxis: d3.Axis<d3.NumberValue>;
    let sig_figs: number = this.viewModel.inputSettings.spc.sig_figs.value;
    let multiplier: number = this.viewModel.inputSettings.spc.multiplier.value;

    if (this.viewModel.plotProperties.displayPlot) {
      if (yAxisProperties.ticks) {
        yAxis = d3.axisLeft(this.viewModel.plotProperties.yScale);
        if (yAxisProperties.tick_count) {
          yAxis.ticks(yAxisProperties.tick_count)
        }
        yAxis.tickFormat(
          d => {
            return this.viewModel.inputData.percentLabels
              ? (<number>d * (multiplier === 100 ? 1 : (multiplier === 1 ? 100 : multiplier))).toFixed(sig_figs) + "%"
              : (<number>d).toFixed(sig_figs);
          }
        );
      } else {
        yAxis = d3.axisLeft(this.viewModel.plotProperties.yScale).tickValues([]);
      }
    } else {
      yAxis = d3.axisLeft(this.viewModel.plotProperties.yScale)
    }

    // Draw axes on plot
    this.svgObjects
        .yAxisGroup
        .call(yAxis)
        .attr("color", this.viewModel.plotProperties.displayPlot ? yAxisProperties.colour : "#FFFFFF")
        .attr("transform", "translate(" + this.viewModel.plotProperties.xAxis.start_padding + ",0)")
        .selectAll(".tick text")
        // Right-align
        .style("text-anchor", "middle")
        // Rotate tick labels
        .attr("dx", "-1em")
        .attr("transform","rotate(" + yAxisProperties.tick_rotation + ")")
        // Scale font
        .style("font-size", yAxisProperties.tick_size)
        .style("font-family", yAxisProperties.tick_font)
        .style("fill", this.viewModel.plotProperties.displayPlot ? yAxisProperties.tick_colour : "#FFFFFF");

    let yAxisCoordinates: DOMRect = this.svgObjects.yAxisGroup.node().getBoundingClientRect() as DOMRect;
    let leftMidpoint: number = yAxisCoordinates.x * 0.7;

    this.svgObjects
        .yAxisLabels
        .attr("x",leftMidpoint)
        .attr("y",this.viewModel.plotProperties.height/2)
        .attr("transform","rotate(-90," + leftMidpoint +"," + this.viewModel.plotProperties.height/2 +")")
        .text(yAxisProperties.label)
        .style("text-anchor", "middle")
        .style("font-size", yAxisProperties.label_size)
        .style("font-family", yAxisProperties.label_font)
        .style("fill", this.viewModel.plotProperties.displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
  }

  drawLines(): void {
    this.plottingMerged.linesMerged
      = this.svgSelections.lineSelection
                          .enter()
                          .append("path")
                          .merge(<any>this.svgSelections.lineSelection);

    this.plottingMerged.linesMerged.classed('line', true);
    this.plottingMerged.linesMerged.attr("d", d => {
      return d3.line<lineData>()
                .x(d => this.viewModel.plotProperties.xScale(d.x))
                .y(d => this.viewModel.plotProperties.yScale(d.line_value))
                .defined(d => d.line_value !== null && between(d.line_value, this.viewModel.plotProperties.yAxis.lower, this.viewModel.plotProperties.yAxis.upper))
                (d[1])
    });
    this.plottingMerged.linesMerged.attr("fill", "none")
                    .attr("stroke", d => {
                      return this.viewModel.plotProperties.displayPlot
                              ? getAesthetic(d[0], "lines", "colour", this.viewModel.inputSettings)
                              : "#FFFFFF"
                    })
                    .attr("stroke-width", d => {
                      return getAesthetic(d[0], "lines", "width", this.viewModel.inputSettings)
                    })
                    .attr("stroke-dasharray", d => {
                      return getAesthetic(d[0], "lines", "type", this.viewModel.inputSettings)
                    });
    this.svgSelections.lineSelection.exit().remove();
    this.plottingMerged.linesMerged.exit().remove();
  }

  drawDots(): void {
    // Update the datapoints if data is refreshed
    this.plottingMerged.dotsMerged = this.svgSelections
                                          .dotSelection
                                          .enter()
                                          .append("circle")
                                          .merge(<any>this.svgSelections.dotSelection);

    this.plottingMerged.dotsMerged.classed("dot", true);

    this.plottingMerged
        .dotsMerged
        .filter((d: plotData) => d.value !== null)
        .attr("cy", (d: plotData) => this.viewModel.plotProperties.yScale(d.value))
        .attr("cx", (d: plotData) => this.viewModel.plotProperties.xScale(d.x))
        .attr("r", (d: plotData) => d.aesthetics.size)
        .style("fill", (d: plotData) => {
          if (this.viewModel.plotProperties.displayPlot) {
            return between(d.value, this.viewModel.plotProperties.yAxis.lower, this.viewModel.plotProperties.yAxis.upper) ? d.aesthetics.colour : "#FFFFFF";
          } else {
            return "#FFFFFF";
          }
        });

    // Change opacity (highlighting) with selections in other plots
    // Specify actions to take when clicking on dots
    this.plottingMerged.dotsMerged
        .on("click", (event, d) => {
          if (this.viewModel.inputSettings.spc.split_on_click.value) {
            if (this.viewModel.splitIndexes) {
              let xIndex: number = this.viewModel.splitIndexes.indexOf(d.x)
              if (xIndex > -1) {
                this.viewModel.splitIndexes.splice(xIndex, 1)
              } else {
                this.viewModel.splitIndexes.push(d.x)
              }
            } else {
              this.viewModel.splitIndexes = [d.x]
            }
            this.updateOptions.type = 2;
            this.update(this.updateOptions)
          } else {
            // Pass identities of selected data back to PowerBI
            this.selectionManager
                // Propagate identities of selected data back to
                //   PowerBI based on all selected dots
                .select(d.identity, (event.ctrlKey || event.metaKey))
                // Change opacity of non-selected dots
                .then(() => { this.updateHighlighting(); });
                event.stopPropagation();
          }
          });


    // Display tooltip content on mouseover
    this.plottingMerged.dotsMerged.on("mouseover", (event, d) => {
      if (this.viewModel.plotProperties.displayPlot) {
        // Get screen coordinates of mouse pointer, tooltip will
        //   be displayed at these coordinates
        let x = event.pageX;
        let y = event.pageY;

        this.host.tooltipService.show({
            dataItems: d.tooltip,
            identities: [d.identity],
            coordinates: [x, y],
            isTouchEvent: false
        });
      }
    })
    // Hide tooltip when mouse moves out of dot
    .on("mouseout", () => {
      if (this.viewModel.plotProperties.displayPlot) {
        this.host.tooltipService.hide({
            immediately: true,
            isTouchEvent: false
        })
      }
    });
    this.updateHighlighting();

    this.svgSelections.dotSelection.exit().remove();
    this.plottingMerged.dotsMerged.exit().remove();

    this.svg.on('click', () => {
        this.selectionManager.clear();
        this.updateHighlighting();
    });
  }

  addContextMenu(): void {
    this.svg.on('contextmenu', (event) => {
      const eventTarget: EventTarget = event.target;
      let dataPoint: plotData = <plotData>(d3.select(<d3.BaseType>eventTarget).datum());
      this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
          x: event.clientX,
          y: event.clientY
      });
      event.preventDefault();
    });
  }

  updateHighlighting(): void {
    if (!this.plottingMerged.dotsMerged || !this.plottingMerged.linesMerged) {
      return;
    }
    let anyHighlights: boolean = this.viewModel.inputData ? this.viewModel.inputData.anyHighlights : false;
    let allSelectionIDs: ISelectionId[] = this.selectionManager.getSelectionIds() as ISelectionId[];

    let opacityFull: number = this.viewModel.inputSettings.scatter.opacity.value;
    let opacityReduced: number = this.viewModel.inputSettings.scatter.opacity_unselected.value;
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
        return (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
      })
    }
  }
}
