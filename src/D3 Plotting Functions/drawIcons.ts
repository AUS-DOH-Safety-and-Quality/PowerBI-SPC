import * as iconSVG from "./Icons"
import viewModelClass from "../Classes/viewModelClass";
import variationIconsToDraw from "../Functions/variationIconsToDraw";
import initialiseIconSVG from "./Icons/initialiseIconSVG";
import { svgBaseType } from "../visual";

export default function drawIcons(selection: svgBaseType, viewModel: viewModelClass) {
  selection.selectAll(".icongroup").remove()
  const draw_variation: boolean = viewModel.inputSettings.nhs_icons.show_variation_icons;
  if (!draw_variation) {
    return;
  }
  const svg_width: number = viewModel.plotProperties.width
  const svg_height: number = viewModel.plotProperties.height
  const variation_location: string = viewModel.inputSettings.nhs_icons.variation_icons_locations;
  const variation_scaling: number = viewModel.inputSettings.nhs_icons.variation_icons_scaling;

  variationIconsToDraw(viewModel).forEach((icon: string, idx: number) => {
    selection
        .call(initialiseIconSVG, icon, svg_width, svg_height, variation_location, variation_scaling, idx)
        .selectAll(`.${icon}`)
        .call(iconSVG[icon as keyof typeof iconSVG])
  })
}
