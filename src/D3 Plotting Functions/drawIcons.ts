import * as iconSVG from "./Icons"
import variationIconsToDraw from "../Functions/variationIconsToDraw";
import initialiseIconSVG from "./Icons/initialiseIconSVG";
import { svgBaseType, Visual } from "../visual";

export default function drawIcons(selection: svgBaseType, visualObj: Visual) {
  selection.selectAll(".icongroup").remove()
  const draw_variation: boolean = visualObj.viewModel.inputSettings.nhs_icons.show_variation_icons;
  if (!draw_variation) {
    return;
  }
  const svg_width: number = visualObj.viewModel.plotProperties.width
  const svg_height: number = visualObj.viewModel.plotProperties.height
  const variation_location: string = visualObj.viewModel.inputSettings.nhs_icons.variation_icons_locations;
  const variation_scaling: number = visualObj.viewModel.inputSettings.nhs_icons.variation_icons_scaling;
  const variationIconsPresent: string[] = variationIconsToDraw(visualObj.viewModel);
  variationIconsPresent.forEach((icon: string, idx: number) => {
    selection
        .call(initialiseIconSVG, icon, svg_width, svg_height, variation_location, variation_scaling, idx)
        .selectAll(`.${icon}`)
        .call(iconSVG[icon as keyof typeof iconSVG])
  })
}
