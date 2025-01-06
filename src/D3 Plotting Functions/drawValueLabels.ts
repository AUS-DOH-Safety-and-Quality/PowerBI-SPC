import * as d3 from "./D3 Modules";
import type { svgBaseType, Visual } from "../visual";
import type { plotData } from "../Classes";

const labelFormatting = function(selection: d3.Selection<d3.BaseType, plotData, d3.BaseType, unknown>, visualObj: Visual) {
  // -90 degrees for vertically above, 90 degrees for vertically below
  const allData = selection.data();
  const initialLabelXY: {x: number, y: number, theta: number, line_offset: number, marker_offset: number}[] = allData.map(d => {
    const label_direction_mult: number = d.label.aesthetics.label_position === "top" ? -1 : 1;
    const plotHeight: number = visualObj.viewModel.svgHeight;
    const xAxisHeight: number = plotHeight - visualObj.viewModel.plotProperties.yAxis.start_padding;
    const label_position: string = d.label.aesthetics.label_position;
    let y_offset: number = d.label.aesthetics.label_y_offset;
    const label_initial: number = label_position === "top" ? (0 + y_offset) : (xAxisHeight - y_offset);
    const y: number = visualObj.viewModel.plotProperties.yScale(d.value);
    let side_length: number = label_position === "top" ? (y - label_initial) : (label_initial - y);
    const x_val = visualObj.viewModel.plotProperties.xScale(d.x);
    const y_val = visualObj.viewModel.plotProperties.yScale(d.value);

    const theta: number = d.label.angle ?? (d.label.aesthetics.label_angle_offset + label_direction_mult * 90);
    side_length = d.label.distance ?? (Math.min(side_length, d.label.aesthetics.label_line_max_length));

    let line_offset: number = d.label.aesthetics.label_line_offset;
    line_offset = label_position === "top" ? line_offset : -(line_offset + d.label.aesthetics.label_size / 2);

    let marker_offset: number = d.label.aesthetics.label_marker_offset + d.label.aesthetics.label_size / 2;
    marker_offset = label_position === "top" ? -marker_offset : marker_offset;

    return {x: x_val + side_length * Math.cos(theta * Math.PI / 180),
            y: y_val + side_length * Math.sin(theta * Math.PI / 180),
            theta: theta,
            line_offset: line_offset,
            marker_offset: marker_offset
          };

  })

  selection.select("text")
            .text(d => d.label.text_value)
            .attr("x", (_, i) => initialLabelXY[i].x)
            .attr("y", (_, i) => initialLabelXY[i].y)
            .style("text-anchor", "middle")
            .style("font-size", d => `${d.label.aesthetics.label_size}px`)
            .style("font-family", d => d.label.aesthetics.label_font)
            .style("fill", d => d.label.aesthetics.label_colour);

  selection.select("line")
            .attr("x1", (_, i) => initialLabelXY[i].x)
            .attr("y1", (_, i) => initialLabelXY[i].y + initialLabelXY[i].line_offset)
            .attr("x2", (d, i) => {
              const marker_offset: number = initialLabelXY[i].marker_offset;
              const angle: number = initialLabelXY[i].theta - (d.label.aesthetics.label_position === "top" ? 180 : 0);
              return visualObj.viewModel.plotProperties.xScale(d.x) + marker_offset * Math.cos(angle * Math.PI / 180);
            })
            .attr("y2", (d, i) => {
              const marker_offset: number = initialLabelXY[i].marker_offset;
              const angle: number = initialLabelXY[i].theta -(d.label.aesthetics.label_position === "top" ? 180 : 0);
              return visualObj.viewModel.plotProperties.yScale(d.value) + marker_offset * Math.sin(angle * Math.PI / 180);
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
            .attr("transform", (d, i) => {
              const marker_offset: number = initialLabelXY[i].marker_offset;
              //const label_position: string = d.label.aesthetics.label_position;
              const x: number = visualObj.viewModel.plotProperties.xScale(d.x);
              const y: number = visualObj.viewModel.plotProperties.yScale(d.value);
              const angle: number = initialLabelXY[i].theta - (d.label.aesthetics.label_position === "top" ? 180 : 0);
              const x_offset: number = marker_offset * Math.cos(angle * Math.PI / 180);
              const y_offset: number = marker_offset * Math.sin(angle * Math.PI / 180);

              return `translate(${x + x_offset}, ${y + y_offset}) rotate(${angle + (d.label.aesthetics.label_position === "top" ? 90 : 270)})`;
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

  const dragFun = d3.drag().on("drag", function(e) {
    const d = e.subject;
    // Get the angle and distance of label from the point
    const x_val = visualObj.viewModel.plotProperties.xScale(d.x);
    const y_val = visualObj.viewModel.plotProperties.yScale(d.value);
    const angle = Math.atan2(e.sourceEvent.y - y_val, e.sourceEvent.x - x_val) * 180 / Math.PI;
    const distance = Math.sqrt(Math.pow(e.sourceEvent.y - y_val, 2) + Math.pow(e.sourceEvent.x - x_val, 2));

    const marker_offset: number = 10;
    const x_offset: number = marker_offset * Math.cos(angle * Math.PI / 180);
    const y_offset: number = marker_offset * Math.sin(angle * Math.PI / 180);

    e.subject.label.angle = angle;
    e.subject.label.distance = distance;
    d3.select(this)
      .select("text")
      .attr("x", e.sourceEvent.x)
      .attr("y", e.sourceEvent.y);

    let line_offset: number = d.label.aesthetics.label_line_offset;
    line_offset = d.label.aesthetics.label_position === "top" ? line_offset : -(line_offset + d.label.aesthetics.label_size / 2);

    d3.select(this)
      .select("line")
      .attr("x1", e.sourceEvent.x)
      .attr("y1", e.sourceEvent.y + line_offset)
      .attr("x2", x_val + x_offset)
      .attr("y2", y_val + y_offset);

    d3.select(this)
      .select("path")
      .attr("transform", `translate(${x_val + x_offset}, ${y_val + y_offset}) rotate(${angle - 90})`);
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
