import * as d3 from "./D3 Modules";
import type { svgBaseType, Visual } from "../visual";
import type { plotData } from "../Classes";

const degToRad: number = Math.PI / 180;

const calcCoord = function(axis: "x" | "y", d: plotData, visualObj: Visual) {
  const plotHeight: number = visualObj.viewModel.svgHeight;
  const xAxisHeight: number = plotHeight - visualObj.viewModel.plotProperties.yAxis.start_padding;
  const label_position: string = d.label.aesthetics.label_position;
  let y_offset: number = d.label.aesthetics.label_y_offset;
  const label_height: number = label_position === "top" ? (0 + y_offset) : (xAxisHeight - y_offset);

  const y: number = visualObj.viewModel.plotProperties.yScale(d.value);

  let side_length: number = label_position === "top" ? (y - label_height) : (label_height - y);
  side_length = Math.min(side_length, d.label.aesthetics.label_line_max_length);
  if (axis === "x") {
    const theta: number = d.label.aesthetics.label_angle_offset;
    const x: number = visualObj.viewModel.plotProperties.xScale(d.x);
    // When angle offset provided, calculate adjusted x coordinate using law of sines
    const theta_2: number = 180 - (90 + theta);

    return d.label.x ?? Math.sin(theta * degToRad) * side_length / Math.sin(theta_2 * degToRad) + x;
  } else {
    return d.label.y ?? y + (label_position === "top" ? -side_length : side_length);
  }

}

const labelFormatting = function(selection: d3.Selection<d3.BaseType, plotData, d3.BaseType, unknown>, visualObj: Visual) {
  selection.select("text")
            .text(d => d.label.text_value)
            .attr("x", d => calcCoord("x", d, visualObj))
            .attr("y", d => calcCoord("y", d, visualObj))
            .style("text-anchor", "middle")
            .style("font-size", d => `${d.label.aesthetics.label_size}px`)
            .style("font-family", d => d.label.aesthetics.label_font)
            .style("fill", d => d.label.aesthetics.label_colour);

  selection.select("line")
            .attr("x1", d => calcCoord("x", d, visualObj))
            .attr("y1", d => {
              const label_position: string = d.label.aesthetics.label_position;
              let line_offset: number = d.label.aesthetics.label_line_offset;
              line_offset = label_position === "top" ? line_offset : -(line_offset + d.label.aesthetics.label_size / 2);
              return calcCoord("y", d, visualObj) + line_offset
            })
            .attr("x2", d => visualObj.viewModel.plotProperties.xScale(d.x))
            .attr("y2", d => {
              const label_position: string = d.label.aesthetics.label_position;
              let marker_offset: number = d.label.aesthetics.label_marker_offset + d.label.aesthetics.label_size / 2;
              marker_offset = label_position === "top" ? -marker_offset : marker_offset;
              return visualObj.viewModel.plotProperties.yScale(d.value) + marker_offset
            })
            .style("stroke", visualObj.viewModel.inputSettings.settings.labels.label_line_colour)
            .style("stroke-width", d => (d.label.text_value ?? "") === "" ? 0 : visualObj.viewModel.inputSettings.settings.labels.label_line_width)
            .style("stroke-dasharray", visualObj.viewModel.inputSettings.settings.labels.label_line_type);

  selection.select("path")
            .attr("d", d => {
              const show_marker: boolean = d.label.aesthetics.label_marker_show && (d.label.text_value ?? "") !== "";
              const marker_size: number = show_marker ? Math.pow(d.label.aesthetics.label_marker_size, 2) : 0;
              return d3.symbol().type(d3.symbolTriangle).size(marker_size)()
            })
            .attr("transform", d => {
              const label_position: string = d.label.aesthetics.label_position;
              const x: number = visualObj.viewModel.plotProperties.xScale(d.x);
              const y: number = visualObj.viewModel.plotProperties.yScale(d.value);
              let marker_offset: number = d.label.aesthetics.label_marker_offset + d.label.aesthetics.label_size / 2;
              marker_offset = label_position === "top" ? -marker_offset : marker_offset;
              return `translate(${x},${y + marker_offset}) rotate(${label_position === "top" ? 180 : 0})`;
            })
            .style("fill", d => d.label.aesthetics.label_marker_colour)
            .style("stroke", d => d.label.aesthetics.label_marker_outline_colour)
}

export default function drawLabels(selection: svgBaseType, visualObj: Visual) {
  if (!visualObj.viewModel.inputSettings.settings.labels.show_labels) {
    selection.select(".text-labels").remove();
    return;
  }

  if (selection.select(".text-labels").empty()) {
    selection.append("g").classed("text-labels", true);
  }

  const label_position: string = visualObj.viewModel.inputSettings.settings.labels.label_position;
  let line_offset: number = visualObj.viewModel.inputSettings.settings.labels.label_line_offset;
  line_offset = label_position === "top" ? line_offset : -(line_offset + visualObj.viewModel.inputSettings.settings.labels.label_size / 2);

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
                grp.append("path")

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
