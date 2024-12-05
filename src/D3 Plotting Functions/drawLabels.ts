import * as d3 from "./D3 Modules";
import type { svgBaseType, Visual } from "../visual";

export default function drawLabels(selection: svgBaseType, visualObj: Visual) {
  selection.select(".text-labels")
            .selectAll(".text-group-inner")
            .data(visualObj.viewModel.plotPoints)
            .join(
              (enter) => {
                let grp = enter.append("g").classed("text-group-inner", true)
                grp.append("text")
                    .text(d => d.label.text_value)
                    .attr("x", d => visualObj.viewModel.plotProperties.xScale(d.x))
                    .attr("y", 20)
                    .style("text-anchor", "middle");

                grp.append("line")
                    .attr("x1", d => visualObj.viewModel.plotProperties.xScale(d.x))
                    .attr("y1", 25)
                    .attr("x2", d => visualObj.viewModel.plotProperties.xScale(d.x))
                    .attr("y2", d => visualObj.viewModel.plotProperties.yScale(d.value))
                    .style("stroke", "black")
                    .style("stroke-width", d => d.label.text_value === "" ? 0 : 1);

                grp.call(d3.drag().on("drag", function(e) {
                  e.subject.label.x = e.sourceEvent.x;
                  e.subject.label.y = e.sourceEvent.y;
                  d3.select(this)
                    .select("text")
                    .attr("x", e.sourceEvent.x)
                    .attr("y", e.sourceEvent.y);

                  d3.select(this)
                    .select("line")
                    .attr("x1", e.sourceEvent.x)
                    .attr("y1", e.sourceEvent.y + 5);
                }));

                return grp
              },
              (update) => {
                update.select("text")
                      .text(d => d.label.text_value)
                      .attr("x", d => d.label.x ?? visualObj.viewModel.plotProperties.xScale(d.x))
                      .attr("y", d => d.label.y ?? 20)
                      .style("text-anchor", "middle");
                update.select("line")
                      .attr("x1", d => d.label.x ?? visualObj.viewModel.plotProperties.xScale(d.x))
                      .attr("y1", d => (d.label.y ?? 20) + 5)
                      .attr("x2", d => visualObj.viewModel.plotProperties.xScale(d.x))
                      .attr("y2", d => visualObj.viewModel.plotProperties.yScale(d.value))
                      .style("stroke-width", d => d.label.text_value === "" ? 0 : 1);

                return update
              }
            )
}
