import * as d3 from "./D3 Modules";
import type { svgBaseType, Visual } from "../visual";
import { plotData } from "../Classes";

const degToRad: number = Math.PI / 180;

const labelFormatting = function(selection: d3.Selection<d3.BaseType, plotData, d3.BaseType, unknown>, visualObj: Visual) {
  let label_options = visualObj.viewModel.inputSettings.settings.label_options;
  const plotHeight: number = visualObj.viewModel.svgHeight;
  const xAxisHeight: number = plotHeight - visualObj.viewModel.plotProperties.yAxis.start_padding;
  const label_position: string = visualObj.viewModel.inputSettings.settings.label_options.label_position;
  let y_offset: number = visualObj.viewModel.inputSettings.settings.label_options.label_y_offset;
  let line_offset: number = visualObj.viewModel.inputSettings.settings.label_options.label_line_offset;
  line_offset = label_position === "top" ? line_offset : -(line_offset + visualObj.viewModel.inputSettings.settings.label_options.label_size / 2);
  const label_height: number = label_position === "top" ? (0 + y_offset) : (xAxisHeight - y_offset);
  const theta: number = visualObj.viewModel.inputSettings.settings.label_options.label_angle_offset;
  const max_line_length: number = visualObj.viewModel.inputSettings.settings.label_options.label_line_max_length;

  selection.select("text")
            .text(d => d.label.text_value)
            .attr("x", d => {
              const y: number = visualObj.viewModel.plotProperties.yScale(d.value);
              let side_length: number = label_position === "top" ? (y - label_height) : (label_height - y);
              side_length = Math.min(side_length, max_line_length);
              const x: number = visualObj.viewModel.plotProperties.xScale(d.x);
              // When angle offset provided, calculate adjusted x coordinate using law of sines
              const theta_2: number = 180 - (90 + theta);
              return d.label.x ?? Math.sin(theta * degToRad) * side_length / Math.sin(theta_2 * degToRad) + x;
            })
            .attr("y", d => {
              const y: number = visualObj.viewModel.plotProperties.yScale(d.value);
              let side_length: number = label_position === "top" ? (y - label_height) : (label_height - y);
              side_length = Math.min(side_length, max_line_length);
              return d.label.y ?? y + (label_position === "top" ? -side_length : side_length);
            })
            .style("text-anchor", "middle")
            .style("font-size", `${label_options.label_size}px`)
            .style("font-family", label_options.label_font)
            .style("fill", label_options.label_colour);

  selection.select("line")
            .attr("x1", d => {
              const y: number = visualObj.viewModel.plotProperties.yScale(d.value);
              let side_length: number = label_position === "top" ? (y - label_height) : (label_height - y);
              side_length = Math.min(side_length, max_line_length);
              const x: number = visualObj.viewModel.plotProperties.xScale(d.x);
              // When angle offset provided, calculate adjusted x coordinate using law of sines
              const theta_2: number = 180 - (90 + theta);
              return d.label.x ?? Math.sin(theta * degToRad) * side_length / Math.sin(theta_2 * degToRad) + x;
            })
            .attr("y1", d => {
              const y: number = visualObj.viewModel.plotProperties.yScale(d.value);
              let side_length: number = label_position === "top" ? (y - label_height) : (label_height - y);
              side_length = Math.min(side_length, max_line_length);
              return (d.label.y ?? y + (label_position === "top" ? -side_length : side_length)) + line_offset;
            })
            .attr("x2", d => visualObj.viewModel.plotProperties.xScale(d.x))
            .attr("y2", d => visualObj.viewModel.plotProperties.yScale(d.value))
            .style("stroke", visualObj.viewModel.inputSettings.settings.label_options.label_line_colour)
            .style("stroke-width", d => (d.label.text_value ?? "") === "" ? 0 : visualObj.viewModel.inputSettings.settings.label_options.label_line_width)
            .style("stroke-dasharray", visualObj.viewModel.inputSettings.settings.label_options.label_line_type);
}

export default function drawLabels(selection: svgBaseType, visualObj: Visual) {
  if (!visualObj.viewModel.inputSettings.settings.label_options.show_labels) {
    selection.select(".text-labels").remove();
    return;
  }

  if (selection.select(".text-labels").empty()) {
    selection.append("g").classed("text-labels", true);
  }

  const label_position: string = visualObj.viewModel.inputSettings.settings.label_options.label_position;
  let line_offset: number = visualObj.viewModel.inputSettings.settings.label_options.label_line_offset;
  line_offset = label_position === "top" ? line_offset : -(line_offset + visualObj.viewModel.inputSettings.settings.label_options.label_size / 2);

  const dragFun = d3.drag().on("drag", function(e) {
    e.subject.label.x = e.sourceEvent.x;
    e.subject.label.y = e.sourceEvent.y;
    d3.select(this)
      .select("text")
      .attr("x", e.sourceEvent.x)
      .attr("y", e.sourceEvent.y);

    d3.select(this)
      .select("line")
      .attr("x1", e.sourceEvent.x)
      .attr("y1", e.sourceEvent.y + line_offset);
  });

  selection.select(".text-labels")
            .selectAll(".text-group-inner")
            .data(visualObj.viewModel.plotPoints)
            .join(
              (enter) => {
                let grp = enter.append("g").classed("text-group-inner", true)
                grp.append("text");
                grp.append("line");

                grp.call(labelFormatting, visualObj)
                   .call(dragFun);
                return grp
              },
              (update) => {
                update.call(labelFormatting, visualObj);
                return update
              }
            )
}
