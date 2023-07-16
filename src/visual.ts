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
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import viewModelClass from "./Classes/viewModelClass"
import { plotData } from "./Classes/viewModelClass";
import * as d3 from "d3";
import plottingClass from "./Classes/plottingClass";

export class Visual implements IVisual {
  private host: IVisualHost;
  private plotting: plottingClass;
  private updateOptions: VisualUpdateOptions;
  private viewModel: viewModelClass;
  private selectionManager: ISelectionManager;
  // Service for notifying external clients (export to powerpoint/pdf) of rendering status
  private events: IVisualEventService;

  constructor(options: VisualConstructorOptions) {
    console.log("Constructor start")
    console.log(options)
    this.events = options.host.eventService;
    this.host = options.host;
    this.plotting = new plottingClass(options);
    this.viewModel = new viewModelClass();
    this.viewModel.firstRun = true;

    this.selectionManager = this.host.createSelectionManager();

    this.selectionManager.registerOnSelectCallback(() => this.updateHighlighting());
    console.log("Constructor finish")
  }

  public update(options: VisualUpdateOptions) {
    console.log("Update start")
    try {
      this.events.renderingStarted(options);
      console.log(options)
      this.updateOptions = options;

      console.log("viewModel start")
      this.viewModel.update({ options: options, host: this.host });

      console.log("Draw plot")
      this.plotting.draw(this.viewModel);

      this.addInteractivity();
      this.updateHighlighting();
      this.addContextMenu();

      this.plotting.svg.on('click', () => {
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

  addInteractivity(): void {
    if (!this.viewModel.plotProperties.displayPlot) {
      return;
    }
    // Change opacity (highlighting) with selections in other plots
    // Specify actions to take when clicking on dots
    this.plotting
        .svgDots
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

    const xAxisLine = this.plotting
                          .svgTooltipLine
                          .tooltipLineGroup
                          .selectAll(".ttip-line")
                          .selectChildren();

    this.plotting
        .svgTooltipLine
        .tooltipLineGroup
        .selectAll(".obs-sel")
        .selectChildren()
        .on("mousemove", (event) => {
          const xValue: number = this.viewModel.plotProperties.xScale.invert(event.pageX);
          const xRange: number[] = this.viewModel
                                        .plotPoints
                                        .map(d => d.x)
                                        .map(d => Math.abs(d - xValue));
          const nearestDenominator: number = d3.leastIndex(xRange,(a,b) => a-b);
          const scaled_x: number = this.viewModel.plotProperties.xScale(this.viewModel.plotPoints[nearestDenominator].x)
          const scaled_y: number = this.viewModel.plotProperties.yScale(this.viewModel.plotPoints[nearestDenominator].value)

          this.host.tooltipService.show({
            dataItems: this.viewModel.plotPoints[nearestDenominator].tooltip,
            identities: [this.viewModel.plotPoints[nearestDenominator].identity],
            coordinates: [scaled_x, scaled_y],
            isTouchEvent: false
          });
          xAxisLine.style("fill-opacity", 1).attr("transform", `translate(${scaled_x},0)`);
        })
        .on("mouseleave", () => {
          this.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
          xAxisLine.style("fill-opacity", 0);
        });
  }

  addContextMenu(): void {
    this.plotting.svg.on('contextmenu', (event) => {
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

    this.plotting.svgLines.highlight(anyHighlights, allSelectionIDs, opacityFull, opacityReduced)
    this.plotting.svgDots.highlight(anyHighlights, allSelectionIDs, opacityFull, opacityReduced)
  }
}
