import type { svgBaseType, Visual } from "../visual";
import type { plotData } from "../Classes/viewModelClass";
import { drawValueLabels } from "powerbi-visuals-core/rendering";

export default function drawLabels(selection: svgBaseType, visualObj: Visual) {
  const svg = selection.node();
  if (svg === null) return;
  const viewModel = visualObj.viewModel;
  const labelSettings = viewModel.inputSettings.settings[0].labels;
  drawValueLabels(svg, {
    visible: labelSettings.show_labels && (viewModel.inputData[0]?.anyLabels ?? false),
    points: viewModel.plotPoints[0] as plotData[],
    xScale: visualObj.plotProperties.xScale,
    yScale: visualObj.plotProperties.yScale,
    plotHeight: viewModel.svgHeight,
    bottomPadding: visualObj.plotProperties.yAxis.start_padding,
    line: { colour: labelSettings.label_line_colour, width: labelSettings.label_line_width, type: labelSettings.label_line_type },
    interactive: !viewModel.headless
  });
}
