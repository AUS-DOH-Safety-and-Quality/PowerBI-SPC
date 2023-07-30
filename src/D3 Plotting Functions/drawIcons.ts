import * as nhsIcons from "./NHS Icons"
import initialiseIconSVG from "./initialiseIconSVG";
import { assuranceIconToDraw, variationIconsToDraw } from "../Functions";
import type { svgBaseType, Visual } from "../visual";
import type { defaultSettingsType } from "../Classes";

export default function drawIcons(selection: svgBaseType, visualObj: Visual): void {
  selection.selectAll(".icongroup").remove()
  if (!(visualObj.viewModel.plotProperties.displayPlot)) {
    return;
  }
  const nhsIconSettings: defaultSettingsType["nhs_icons"] = visualObj.viewModel.inputSettings.settings.nhs_icons;
  const draw_variation: boolean = nhsIconSettings.show_variation_icons;
  const variation_location: string = nhsIconSettings.variation_icons_locations;
  const svg_width: number = visualObj.viewModel.plotProperties.width
  const svg_height: number = visualObj.viewModel.plotProperties.height
  let numVariationIcons: number = 0;

  if (draw_variation) {
    const variation_scaling: number = nhsIconSettings.variation_icons_scaling;
    const variationIconsPresent: string[] = variationIconsToDraw(visualObj.viewModel);
    variationIconsPresent.forEach((icon: string, idx: number) => {
      selection
          .call(initialiseIconSVG, icon, svg_width, svg_height, variation_location, variation_scaling, idx)
          .selectAll(`.${icon}`)
          .call(nhsIcons[icon as keyof typeof nhsIcons])
    })
    numVariationIcons = variationIconsPresent.length;
  }

  const draw_assurance: boolean = nhsIconSettings.show_assurance_icons;
  if (draw_assurance) {
    const assurance_location: string = nhsIconSettings.assurance_icons_locations;
    const assurance_scaling: number = nhsIconSettings.assurance_icons_scaling;
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
        .call(nhsIcons[assuranceIconPresent as keyof typeof nhsIcons])
  }
}
