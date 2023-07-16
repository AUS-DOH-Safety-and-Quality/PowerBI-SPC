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
import viewModelClass from "./Classes/viewModelClass"
import { plotData } from "./Classes/viewModelClass";
import * as d3 from "d3";
import svgObjectClass from "./Classes/svgObjectClass"
import svgIconClass from "./Classes/svgIconClass"
import svgSelectionClass from "./Classes/svgSelectionClass"
import { axisProperties } from "./Classes/plotPropertiesClass"
import svgLinesClass from "./Classes/svgLinesClass";
import svgDotsClass from "./Classes/svgDotsClass";
import svgTooltipLineClass from "./Classes/svgTooltipLineClass";

type SelectionAny = d3.Selection<any, any, any, any>;

export class Visual implements IVisual {
  private host: IVisualHost;
  private updateOptions: VisualUpdateOptions;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private svgObjects: svgObjectClass;
  private svgIcons: svgIconClass;
  private svgLines: svgLinesClass;
  private svgDots: svgDotsClass
  private svgTooltipLine: svgTooltipLineClass;
  private svgSelections: svgSelectionClass;
  private viewModel: viewModelClass;
  private selectionManager: ISelectionManager;
  // Service for notifying external clients (export to powerpoint/pdf) of rendering status
  private events: IVisualEventService;
  private refreshingAxis: boolean;

  constructor(options: VisualConstructorOptions) {
    console.log("Constructor start")
    console.log(options)
    this.events = options.host.eventService;
    this.host = options.host;
    this.svg = d3.select(options.element)
                  .append("svg");

    this.svgObjects = new svgObjectClass(this.svg);
    this.svgIcons = new svgIconClass(this.svg);
    this.svgLines = new svgLinesClass(this.svg);
    this.svgDots = new svgDotsClass(this.svg);
    this.svgTooltipLine = new svgTooltipLineClass(this.svg);
    this.svgSelections = new svgSelectionClass();
    this.viewModel = new viewModelClass();
    this.viewModel.firstRun = true;

    this.selectionManager = this.host.createSelectionManager();

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

      console.log("TooltipTracking start")
      this.svgTooltipLine.draw(this.viewModel)
      this.initTooltipTracking();

      console.log("Draw axes start")
      this.drawXAxis();
      this.drawYAxis();

      console.log("Draw Lines start")
      this.svgLines.draw(this.viewModel)

      console.log("Draw dots start")
      this.svgDots.draw(this.viewModel)
      this.addDotsInteractivity();

      console.log("Draw icons start")
      this.svgIcons.drawIcons(this.viewModel)

      this.updateHighlighting();

      this.addContextMenu();

      this.svg.on('click', () => {
        this.selectionManager.clear();
        this.updateHighlighting();
      });

      this.events.renderingFinished(options);
      console.log("Update finished")
      console.log(this.viewModel)
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
    const xAxisLine = this.svgSelections
                        .tooltipLineSelection
                        .enter()
                        .append("rect")
                        .merge(<any>this.svgSelections.tooltipLineSelection);
    xAxisLine.classed("ttip-line", true);
    xAxisLine.attr("stroke-width", "1px")
            .attr("width", ".5px")
            .attr("height", this.viewModel.plotProperties.height)
            .style("fill-opacity", 0);

    this.svgTooltipLine
        .tooltipLineGroup
        .selectAll(".obs-sel")
        .selectChildren()
        .on("mousemove", (event) => {
          if (this.viewModel.plotProperties.displayPlot) {
            const xValue: number = this.viewModel.plotProperties.xScale.invert(event.pageX);
            const xRange: number[] = this.viewModel
                                        .plotPoints
                                        .map(d => d.x)
                                        .map(d => Math.abs(d - xValue));
            const nearestDenominator: number = d3.leastIndex(xRange,(a,b) => a-b) as number;
            const scaled_x: number = this.viewModel.plotProperties.xScale(this.viewModel.plotPoints[nearestDenominator].x)
            const scaled_y: number = this.viewModel.plotProperties.yScale(this.viewModel.plotPoints[nearestDenominator].value)

            this.host.tooltipService.show({
              dataItems: this.viewModel.plotPoints[nearestDenominator].tooltip,
              identities: [this.viewModel.plotPoints[nearestDenominator].identity],
              coordinates: [scaled_x, scaled_y],
              isTouchEvent: false
            });
            xAxisLine.style("fill-opacity", 1).attr("transform", "translate(" + scaled_x + ",0)");
          }
        })
        .on("mouseleave", () => {
          if (this.viewModel.plotProperties.displayPlot) {
            this.host.tooltipService.hide({
                immediately: true,
                isTouchEvent: false
            });
            xAxisLine.style("fill-opacity", 0);
          }
        });
    xAxisLine.exit().remove()
  }

  drawXAxis(): void {
    const xAxisProperties: axisProperties = this.viewModel.plotProperties.xAxis;
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

    const axisHeight: number = this.viewModel.plotProperties.height - this.viewModel.plotProperties.yAxis.end_padding;

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

    const currNode: SVGGElement = this.svgObjects.xAxisGroup.node() as SVGGElement;
    const xAxisCoordinates: DOMRect = currNode.getBoundingClientRect() as DOMRect;

    // Update padding and re-draw axis if large tick values rendered outside of plot
    const tickBelowPlotAmount: number = xAxisCoordinates.bottom - this.viewModel.plotProperties.height;
    const tickLeftofPlotAmount: number = xAxisCoordinates.left;
    if ((tickBelowPlotAmount > 0 || tickLeftofPlotAmount < 0)) {
      if (!this.refreshingAxis) {
        this.refreshingAxis = true
        this.viewModel.plotProperties.yAxis.end_padding += tickBelowPlotAmount;
        this.viewModel.plotProperties.initialiseScale();
        this.drawXAxis();
      }
    }
    this.refreshingAxis = false

    const bottomMidpoint: number = this.viewModel.plotProperties.height - (this.viewModel.plotProperties.height - xAxisCoordinates.bottom) / 2.5;

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
    const yAxisProperties: axisProperties = this.viewModel.plotProperties.yAxis;
    let yAxis: d3.Axis<d3.NumberValue>;
    const yaxis_sig_figs: number = this.viewModel.inputSettings.y_axis.ylimit_sig_figs;
    const sig_figs: number = yaxis_sig_figs === null ? this.viewModel.inputSettings.spc.sig_figs : yaxis_sig_figs;
    const multiplier: number = this.viewModel.inputSettings.spc.multiplier;

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
        .style("text-anchor", "right")
        // Rotate tick labels
        .attr("transform","rotate(" + yAxisProperties.tick_rotation + ")")
        // Scale font
        .style("font-size", yAxisProperties.tick_size)
        .style("font-family", yAxisProperties.tick_font)
        .style("fill", this.viewModel.plotProperties.displayPlot ? yAxisProperties.tick_colour : "#FFFFFF");

    const currNode: SVGGElement = this.svgObjects.yAxisGroup.node() as SVGGElement;
    const yAxisCoordinates: DOMRect = currNode.getBoundingClientRect() as DOMRect;
    const leftMidpoint: number = yAxisCoordinates.x * 0.7;

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

  addDotsInteractivity(): void {
    if (!this.viewModel.plotProperties.displayPlot) {
      return;
    }
    // Change opacity (highlighting) with selections in other plots
    // Specify actions to take when clicking on dots
    this.svgDots
        .dotsGroup
        .selectAll(".dotsgroup")
        .selectChildren()
        .on("click", (event, d: plotData) => {
          if (this.viewModel.inputSettings.spc.split_on_click) {
            // Identify whether limits are already split at datapoint, and undo if so
            const xIndex: number = this.viewModel.splitIndexes.indexOf(d.x)
            if (xIndex > -1) {
              this.viewModel.splitIndexes.splice(xIndex, 1)
            } else {
              this.viewModel.splitIndexes.push(d.x)
            }

            // Store the current limit-splitting indices to make them available between full refreshes
            // This also initiates a visual update() call, causing the limits to be re-calculated
            this.host.persistProperties({
              replace: [{
                objectName: "split_indexes_storage",
                selector: undefined,
                properties: { split_indexes: JSON.stringify(this.viewModel.splitIndexes) }
              }]
            });
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
        })
        // Display tooltip content on mouseover
        .on("mouseover", (event, d: plotData) => {
          // Get screen coordinates of mouse pointer, tooltip will
          //   be displayed at these coordinates
          const x = event.pageX;
          const y = event.pageY;

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
  }

  addContextMenu(): void {
    this.svg.on('contextmenu', (event) => {
      const eventTarget: EventTarget = event.target;
      const dataPoint: plotData = <plotData>(d3.select(<d3.BaseType>eventTarget).datum());
      this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
          x: event.clientX,
          y: event.clientY
      });
      event.preventDefault();
    });
  }

  updateHighlighting(): void {
    if (!this.viewModel.plotPoints || !this.viewModel.groupedLines) {
      return;
    }
    const anyHighlights: boolean = this.viewModel.inputData ? this.viewModel.inputData.anyHighlights : false;
    const allSelectionIDs: ISelectionId[] = this.selectionManager.getSelectionIds() as ISelectionId[];

    const opacityFull: number = this.viewModel.inputSettings.scatter.opacity;
    const opacityReduced: number = this.viewModel.inputSettings.scatter.opacity_unselected;

    this.svgLines.highlight(anyHighlights, allSelectionIDs, opacityFull, opacityReduced)
    this.svgDots.highlight(anyHighlights, allSelectionIDs, opacityFull, opacityReduced)
  }
}
