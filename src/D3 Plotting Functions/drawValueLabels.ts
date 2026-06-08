import * as d3 from "./D3 Modules";
import type { svgBaseType, Visual } from "../visual";
import type { plotData } from "../Classes/viewModelClass";
import isValidNumber from "../Functions/isValidNumber";

function getLabelAttributes(d: plotData, visualObj: Visual): {x: number, y: number, theta: number, line_offset: number, marker_offset: number} {
  const label_direction_mult: number = d.label.aesthetics.label_position === "top" ? -1 : 1;
  const plotHeight: number = visualObj.viewModel.svgHeight;
  const xAxisHeight: number = plotHeight - visualObj.plotProperties.yAxis.start_padding;
  const label_position: string = d.label.aesthetics.label_position;
  let y_offset: number = d.label.aesthetics.label_y_offset;
  const label_initial: number = label_position === "top" ? (0 + y_offset) : (xAxisHeight - y_offset);
  const y: number = visualObj.plotProperties.yScale(d.value) as number;
  let side_length: number = label_position === "top" ? (y - label_initial) : (label_initial - y);
  const x_val = visualObj.plotProperties.xScale(d.x) as number;
  const y_val = visualObj.plotProperties.yScale(d.value) as number;

  const theta: number = d.label.angle ?? (d.label.aesthetics.label_angle_offset + label_direction_mult * 90);
  side_length = d.label.distance ?? (Math.min(side_length, d.label.aesthetics.label_line_max_length));

  let line_offset: number = d.label.aesthetics.label_line_offset;
  line_offset = label_position === "top" ? line_offset : -(line_offset + d.label.aesthetics.label_size / 2);

  let marker_offset: number = d.label.aesthetics.label_marker_offset + d.label.aesthetics.label_size / 2;
  marker_offset = label_position === "top" ? -marker_offset : marker_offset;

  const newX: number = x_val + side_length * Math.cos(theta * Math.PI / 180);
  const newY: number = y_val + side_length * Math.sin(theta * Math.PI / 180);

  if (!isValidNumber(newX) || !isValidNumber(newY)) {
    return {
      x: 0,
      y: 0,
      theta: 0,
      line_offset: 0,
      marker_offset: 0
    };
  }

  return {x: newX,
          y: newY,
          theta: theta,
          line_offset: line_offset,
          marker_offset: marker_offset
        };
}

export default function drawLabels(selection: svgBaseType, visualObj: Visual) {
  if (!visualObj.viewModel.inputSettings.settings[0].labels.show_labels
      || !visualObj.viewModel.inputData[0]?.anyLabels) {
    selection.select(".text-labels").remove();
    return;
  }

  if (selection.select(".text-labels").empty()) {
    selection.append("g").classed("text-labels", true);
  }

  /**
   * Convert screen coordinates (clientX/clientY) to SVG coordinates.
   * Works with any SVG element and handles transforms applied to the SVG.
   */
  function screenToSvg(clientX: number, clientY: number, svg: SVGSVGElement) {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const inv = ctm.inverse();
    const transformed = point.matrixTransform(inv);
    return { x: transformed.x, y: transformed.y };
  }

  selection.select(".text-labels")
            .selectAll(".text-group-inner")
            .data(visualObj.viewModel.plotPoints[0] as plotData[])
            .join("g")
            .classed("text-group-inner", true)
            .each(function(d: plotData) {
              const textGroup = d3.select(this);
              if ((d.label.text_value ?? "") === "") {
                textGroup.remove();
                return;
              }

              textGroup.selectAll("*").remove();
              const textElement = textGroup.append("text");
              const lineElement = textGroup.append("line");
              const pathElement = textGroup.append("path");

              const { x, y, line_offset, marker_offset, theta } = getLabelAttributes(d, visualObj);
              const invalidXY: boolean = x === 0 && y === 0;
              if (invalidXY) {
                textGroup.remove();
                return;
              }
              const angle: number = theta - (d.label.aesthetics.label_position === "top" ? 180 : 0);
              const angleToRadians: number = angle * Math.PI / 180;

              textElement
                .attr("x", x)
                .attr("y", y)
                .text(d.label.text_value ?? "")
                .style("text-anchor", "middle")
                .style("font-size", `${d.label.aesthetics.label_size}px`)
                .style("font-family", d.label.aesthetics.label_font)
                .style("fill", d.label.aesthetics.label_colour);

              const markerSize: number = Math.pow(d.label.aesthetics.label_marker_size, 2);
              const markerX = visualObj.plotProperties.xScale(d.x) as number + marker_offset * Math.cos(angleToRadians);
              const markerY = visualObj.plotProperties.yScale(d.value) as number + marker_offset * Math.sin(angleToRadians);

              lineElement
                .attr("x1", x)
                .attr("y1", y + line_offset)
                .attr("x2", markerX)
                .attr("y2", markerY)
                .style("stroke", visualObj.viewModel.inputSettings.settings[0].labels.label_line_colour)
                .style("stroke-width", visualObj.viewModel.inputSettings.settings[0].labels.label_line_width)
                .style("stroke-dasharray", visualObj.viewModel.inputSettings.settings[0].labels.label_line_type);

              const markerRotation = angle + (d.label.aesthetics.label_position === "top" ? 90 : 270);

              pathElement
                .attr("d", d3.symbol().type(d3.symbolTriangle).size(markerSize)())
                .attr("transform", `translate(${markerX}, ${markerY}) rotate(${markerRotation})`)
                .style("fill", d.label.aesthetics.label_marker_colour)
                .style("stroke", d.label.aesthetics.label_marker_outline_colour);

              if (!visualObj.viewModel.headless) {
                // Enable native pointer interactions for dragging
                const x_val = visualObj.plotProperties.xScale(d.x) as number;
                const y_val = visualObj.plotProperties.yScale(d.value) as number;
                const marker_offset = 10;
                const svgEl = visualObj.svg.node() as SVGSVGElement;

                textGroup
                  .style("touch-action", "none")
                  .on("pointerdown", function(event: PointerEvent) {
                    const g = this as SVGGElement;
                    g.setPointerCapture(event.pointerId);
                    const onMove = (e: PointerEvent) => {
                      const { x, y } = screenToSvg(e.clientX, e.clientY, svgEl);
                      const angle = Math.atan2(y - y_val, x - x_val) * 180 / Math.PI;
                      const distance = Math.sqrt(Math.pow(y - y_val, 2) + Math.pow(x - x_val, 2));
                      d.label.angle = angle;
                      d.label.distance = distance;
                      const x_offset = marker_offset * Math.cos(angle * Math.PI / 180);
                      const y_offset = marker_offset * Math.sin(angle * Math.PI / 180);
                      let line_offset = d.label.aesthetics.label_line_offset;
                      line_offset = d.label.aesthetics.label_position === "top"
                        ? line_offset
                        : -(line_offset + d.label.aesthetics.label_size / 2);
                      textGroup
                        .select("text")
                        .attr("x", x)
                        .attr("y", y);
                      textGroup
                        .select("line")
                        .attr("x1", x)
                        .attr("y1", y + line_offset)
                        .attr("x2", x_val + x_offset)
                        .attr("y2", y_val + y_offset);
                      textGroup
                        .select("path")
                        .attr(
                          "transform",
                          `translate(${x_val + x_offset}, ${y_val + y_offset}) rotate(${angle - 90})`
                        );
                    };
                    const onUp = (e: PointerEvent) => {
                      const g2 = this as SVGGElement;
                      g2.releasePointerCapture(e.pointerId);
                      g2.removeEventListener("pointermove", onMove);
                      g2.removeEventListener("pointerup", onUp);
                      g2.removeEventListener("pointercancel", onUp);
                    };
                    (this as SVGGElement).addEventListener("pointermove", onMove);
                    (this as SVGGElement).addEventListener("pointerup", onUp);
                    (this as SVGGElement).addEventListener("pointercancel", onUp);
                  });
              }
            });
}
