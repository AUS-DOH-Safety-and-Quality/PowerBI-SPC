import { at } from "powerbi-visuals-core/util";
import { nhsIcons } from "./NHS Icons"
import initialiseIconSVG from "./initialiseIconSVG";
import { iconTransformSpec } from "./initialiseIconSVG";
import assuranceIconToDraw from "../Outlier Flagging/assuranceIconToDraw";
import variationIconsToDraw from "../Outlier Flagging/variationIconsToDraw";
import type { MarksSelection } from "powerbi-visuals-core/rendering";
import type { Visual } from "../visual";
import type { settingsValueType } from "../settings";

export default function drawIcons(selection: MarksSelection, visualObj: Visual): void {
  selection.selectAll(".icongroup").remove()
  if (!(visualObj.plotProperties.displayPlot)) {
    return;
  }
  const { settings, derivedSettings } = visualObj.viewModel.inputSettings.group(0);
  const nhsIconSettings: settingsValueType["nhs_icons"] = settings.nhs_icons;
  const draw_variation: boolean = nhsIconSettings.show_variation_icons;
  const variation_location: string = nhsIconSettings.variation_icons_locations;
  const svg_width: number = visualObj.viewModel.svgWidth
  const svg_height: number = visualObj.viewModel.svgHeight
  let numVariationIcons: number = 0;

  if (draw_variation) {
    const variation_scaling: number = nhsIconSettings.variation_icons_scaling;
    const variationIconsPresent = variationIconsToDraw(at(visualObj.viewModel.outliers, 0), settings);
    for (let idx = 0; idx < variationIconsPresent.length; idx++) {
      const icon = at(variationIconsPresent, idx);
      selection
          .call(initialiseIconSVG, icon, iconTransformSpec(svg_width, svg_height, variation_location, variation_scaling, idx))
          .selectAll(`.${icon}`)
          .call(nhsIcons[icon])
    }
    numVariationIcons = variationIconsPresent.length;
  }

  const draw_assurance: boolean = nhsIconSettings.show_assurance_icons;
  if (draw_assurance) {
    const assurance_location: string = nhsIconSettings.assurance_icons_locations;
    const assurance_scaling: number = nhsIconSettings.assurance_icons_scaling;
    const assuranceIconPresent = assuranceIconToDraw(at(visualObj.viewModel.controlLimits, 0),
                                                              settings,
                                                              derivedSettings);
    if (assuranceIconPresent === "none") {
      return;
    }

    const currIconCount: number = (numVariationIcons > 0 && variation_location === assurance_location)
                                    ? numVariationIcons
                                    : 0;
    selection
        .call(initialiseIconSVG, assuranceIconPresent, iconTransformSpec(svg_width, svg_height, assurance_location, assurance_scaling, currIconCount))
        .selectAll(`.${assuranceIconPresent}`)
        .call(nhsIcons[assuranceIconPresent])
  }
}
