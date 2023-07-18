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
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import viewModelClass from "./Classes/viewModelClass"
import { plotData } from "./Classes/viewModelClass";
import * as d3 from "d3";
import * as plottingFunctions from "./D3 Plotting Functions"
import highlight from "./D3 Plotting Functions/highlight";
import plotPropertiesClass from "./Classes/plotPropertiesClass";

export class Visual implements IVisual {
  private host: IVisualHost;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private objectsToPlot: string[] = ["xAxis", "yAxis", "tooltipLine", "lines", "dots", "icons"];
  private viewModel: viewModelClass;
  private selectionManager: ISelectionManager;
  // Service for notifying external clients (export to powerpoint/pdf) of rendering status
  private events: IVisualEventService;

  constructor(options: VisualConstructorOptions) {
    console.log("Constructor start")
    console.log(options)
    this.svg = d3.select(options.element).append("svg");
    this.events = options.host.eventService;
    this.host = options.host;
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

      console.log("viewModel start")
      this.viewModel.update({ options: options, host: this.host });

      console.log("Draw plot")
      this.svg.attr("width", this.viewModel.plotProperties.width)
              .attr("height", this.viewModel.plotProperties.height);
      this.objectsToPlot.forEach(plotObject => {
        this.svg.call(plottingFunctions[plotObject as keyof typeof plottingFunctions],
                      this.viewModel)
      })

      if (this.viewModel.plotProperties.displayPlot) {
        this.addDotsInteractivity();
        this.addTooltipMouseover();
        this.addContextMenu()
        this.updateHighlighting()
      }

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

  addTooltipMouseover(): void {
    const xAxisLine = this.svg.selectAll(".ttip-line").selectChildren();

    this.svg
        .on("mousemove", (event) => {
          const plotProperties: plotPropertiesClass = this.viewModel.plotProperties;
          const plotPoints: plotData[] = this.viewModel.plotPoints

          const xValue: number = plotProperties.xScale.invert(event.pageX);
          const xRange: number[] = plotPoints.map(d => d.x).map(d => Math.abs(d - xValue));
          const nearestDenominator: number = d3.leastIndex(xRange,(a,b) => a-b);
          const x_coord: number = plotProperties.xScale(plotPoints[nearestDenominator].x)
          const y_coord: number = plotProperties.yScale(plotPoints[nearestDenominator].value)

          this.host.tooltipService.show({
            dataItems: plotPoints[nearestDenominator].tooltip,
            identities: [plotPoints[nearestDenominator].identity],
            coordinates: [x_coord, y_coord],
            isTouchEvent: false
          });
          const xAxisHeight: number = plotProperties.height - plotProperties.yAxis.start_padding;
          xAxisLine.style("stroke-opacity", 1)
                    .attr("x1", x_coord)
                    .attr("x2", x_coord);
        })
        .on("mouseleave", () => {
          this.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
          xAxisLine.style("stroke-opacity", 0);
        });
  }

  addDotsInteractivity(): void {
    // Change opacity (highlighting) with selections in other plots
    // Specify actions to take when clicking on dots
    this.svg
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
          }
          event.stopPropagation();
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

    this.svg.on('click', () => {
      this.selectionManager.clear();
      this.updateHighlighting()
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

  updateHighlighting() {
    this.svg.call(highlight, this.viewModel, this.selectionManager.getSelectionIds())
  }
}
