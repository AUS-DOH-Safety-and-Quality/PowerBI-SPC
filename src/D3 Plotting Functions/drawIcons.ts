import * as variationIcon from "./Variation Icons"
import * as assuranceIcon from "./Assurance Icons"
import variationIconsToDraw from "../Functions/variationIconsToDraw";
import initialiseIconSVG from "./initialiseIconSVG";
import { svgBaseType, Visual } from "../visual";
import assuranceIconToDraw from "../Functions/assuranceIconToDraw";

export default function drawIcons(selection: svgBaseType, visualObj: Visual): void {
  selection.selectAll(".icongroup").remove()
  if (!(visualObj.viewModel.plotProperties.displayPlot)) {
    return;
  }
  const draw_variation: boolean = visualObj.viewModel.inputSettings.nhs_icons.show_variation_icons;
  const variation_location: string = visualObj.viewModel.inputSettings.nhs_icons.variation_icons_locations;
  const svg_width: number = visualObj.viewModel.plotProperties.width
  const svg_height: number = visualObj.viewModel.plotProperties.height
  let numVariationIcons: number = 0;

  if (draw_variation) {
    const variation_scaling: number = visualObj.viewModel.inputSettings.nhs_icons.variation_icons_scaling;
    const variationIconsPresent: string[] = variationIconsToDraw(visualObj.viewModel);
    variationIconsPresent.forEach((icon: string, idx: number) => {
      selection
          .call(initialiseIconSVG, icon, svg_width, svg_height, variation_location, variation_scaling, idx)
          .selectAll(`.${icon}`)
          .call(variationIcon[icon as keyof typeof variationIcon])
    })
    numVariationIcons = variationIconsPresent.length;
  }

  const draw_assurance: boolean = visualObj.viewModel.inputSettings.nhs_icons.show_assurance_icons;
  if (draw_assurance) {
    const assurance_location: string = visualObj.viewModel.inputSettings.nhs_icons.assurance_icons_locations;
    const assurance_scaling: number = visualObj.viewModel.inputSettings.nhs_icons.assurance_icons_scaling;
    const assuranceIconPresent: string = assuranceIconToDraw(visualObj.viewModel);
    if (assuranceIconPresent === "none") {
      return;
    }

    const currIconCount: number = (numVariationIcons > 0 && variation_location === assurance_location)
                                    ? numVariationIcons
                                    : 0;
    selection
        .call(initialiseIconSVG, assuranceIconPresent, svg_width, svg_height, assurance_location, assurance_scaling, currIconCount)
        .selectAll(`.${assuranceIconPresent}`)
        .call(assuranceIcon[assuranceIconPresent as keyof typeof assuranceIcon])
  }
}
