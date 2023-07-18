import * as d3 from "d3";
import viewModelClass from "../Classes/viewModelClass";
import drawXAxis from "./drawXAxis";
import drawYAxis from "./drawYAxis";
import drawTooltipLine from "./drawTooltipLine";
import drawLines from "./drawLines";
import drawDots from "./drawDots";
import drawIcons from "./drawIcons";

type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

export default function drawPlot(selection: SelectionBase, viewModel: viewModelClass) {
  selection.attr("width", viewModel.plotProperties.width)
            .attr("height", viewModel.plotProperties.height)
            .call(drawXAxis, viewModel)
            .call(drawYAxis, viewModel)
            .call(drawTooltipLine, viewModel)
            .call(drawLines, viewModel)
            .call(drawDots, viewModel)
            .call(drawIcons, viewModel)
}
