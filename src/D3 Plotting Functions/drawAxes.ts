import type { svgBaseType, Visual } from "../visual";
import { drawAxis } from "powerbi-visuals-core/rendering";

export default function drawAxes(selection: svgBaseType, visualObj: Visual) {
  const svg = selection.node();
  if (svg === null) {
    return;
  }
  const viewModel = visualObj.viewModel;
  const settings = viewModel.inputSettings.settings[0];
  const frame = visualObj.plotProperties;
  const measure = !viewModel.frontend;
  const tickLabels = viewModel.tickLabels;
  drawAxis(svg, {
    axis: "x", frame, show: settings.x_axis.xlimit_show, labelSize: settings.x_axis.xlimit_label_size, measure,
    tickFormat: value => {
      for (let i = 0; i < tickLabels.length; i++) {
        if (tickLabels[i].x === value) {
          return tickLabels[i].label;
        }
      }
      return "";
    }
  });
  const sigFigs = settings.y_axis.ylimit_sig_figs ?? settings.spc.sig_figs;
  const derivedSettings = viewModel.inputSettings.derivedSettings[0];
  drawAxis(svg, {
    axis: "y", frame, show: settings.y_axis.ylimit_show, labelSize: settings.y_axis.ylimit_label_size, measure,
    tickFormat: viewModel.inputData.length > 0 && viewModel.inputData[0]
      ? value => derivedSettings.percentLabels ? `${value.toFixed(sigFigs)}%` : value.toFixed(sigFigs)
      : undefined
  });
}
